import constants from '../../modules/constants';
import { Orders } from '../Orders/Orders';
import zh from './ZohoBooks';
import { retResponse, updateSyncAndReturn } from './zohoCommon';
import { updateOrderStatusFromZoho } from './zohoOrdersMethods';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
// @ts-ignore - Using require to avoid TypeScript errors with alanning:roles
const { Roles } = require('meteor/alanning:roles');
import moment from 'moment';
import 'moment-timezone';
import ZohoSyncUps, { syncUpConstants } from './ZohoSyncUps';
import { bulkUpsertZhInvoices } from '../ZhInvoices/methods';

// Helper function for access denied errors
const handleAccessDenied = () => {
  const error = new Meteor.Error('not-authorized', 'Access denied');
  error.error = 'not-authorized';
  error.reason = 'Access denied';
  throw error;
};

/*
Status of Invoices
Status	Description

draft	Invoices when created will be in Draft status before being sent to the customer.
unpaid	Invoices once sent to the customer with a due date for payment, will be shown as Sent.
overdue	Once the due date for payment is exceeded, it will be shown as Overdue.
partially_paid	When the payment is made for a part of the items in the invoice, it will be shown as Partially Paid.
paid	Once the payment is made by your customer for the invoice raised, it will be shown as Paid.
viewed
sent

INVOICE TO ORDER STATUS MAPPING:
- If ANY invoice is 'unpaid', 'overdue', or 'partially_paid' → Awaiting_Payment (takes precedence)
- If ANY invoice is 'sent' → Shipped (shipping takes precedence over payment)
- If ANY invoice is 'paid' → Completed
- viewed/draft → No status change

Examples:
- ['paid', 'unpaid'] → Awaiting_Payment (unpaid takes precedence)
- ['paid', 'partially_paid'] → Awaiting_Payment (partially_paid takes precedence)
- ['paid', 'sent'] → Shipped (sent takes precedence over paid)
- ['paid', 'draft'] → Completed (paid is highest priority)
- ['sent', 'draft'] → Shipped (sent is highest priority)
*/

/**
 * Creates a standardized invoice object from Zoho invoice data
 * @param {string} orderId - The ID of the related order
 * @param {Object} zhInvoice - The Zoho invoice object
 * @returns {Object} Processed invoice object
 */
const createInvoiceObject = (orderId, zhInvoice) => {
  if (!zhInvoice) {
    throw new Error('No invoice data provided');
  }

  const now = new Date();
  const invoice = {
    // Core invoice data
    orderId,
    zhInvoiceId: zhInvoice.invoice_id || '',
    invoiceNumber: zhInvoice.invoice_number || '',
    referenceNumber: zhInvoice.reference_number || '',
    
    // Status and dates
    status: zhInvoice.status || 'draft',
    date: zhInvoice.date || now,
    dueDate: zhInvoice.due_date || null,
    dueDays: zhInvoice.due_days || 0,
    
    // Financials
    subTotal: zhInvoice.sub_total || 0,
    total: zhInvoice.total || 0,
    balance: zhInvoice.balance || 0,
    taxTotal: zhInvoice.tax_total || 0,
    discountTotal: zhInvoice.discount_total || 0,
    
    // Customer information
    customerId: zhInvoice.customer_id || '',
    customerName: zhInvoice.customer_name || '',
    
    // Line items (simplified for now, can be expanded)
    lineItems: (zhInvoice.line_items || []).map(item => ({
      itemId: item.item_id,
      name: item.name || '',
      description: item.description || '',
      quantity: item.quantity || 0,
      rate: item.rate || 0,
      total: item.item_total || 0,
    })),
    
    // Metadata
    notes: zhInvoice.notes || '',
    terms: zhInvoice.terms || '',
    
    // Timestamps
    createdAt: zhInvoice.created_time || now,
    updatedAt: zhInvoice.last_modified_time || now,
    
    // Original Zoho data (for reference)
    _zohoData: zhInvoice
  };
  
  // Calculate derived fields if needed
  if (!invoice.balance && invoice.status === 'paid') {
    invoice.balance = 0; // Ensure balance is 0 for paid invoices
  }
  
  // Set default due date if not provided (e.g., 30 days from invoice date)
  if (!invoice.dueDate && invoice.date) {
    const dueDate = new Date(invoice.date);
    dueDate.setDate(dueDate.getDate() + (invoice.dueDays || 30));
    invoice.dueDate = dueDate;
  }
  
  return invoice;
};

/**
 * Creates an array of invoice objects from Zoho invoice data
 * @param {string} orderId - The ID of the order these invoices belong to
 * @param {Array} zhInvoices - Array of Zoho invoice objects
 * @returns {Array} Array of processed invoice objects
 */
const getInvoices = (orderId, zhInvoices) => {
  try {
    if (!zhInvoices || !Array.isArray(zhInvoices)) {
      console.warn('No valid invoices provided to getInvoices function');
      return [];
    }

    const processedInvoices = zhInvoices
      .map((zhInvoice) => {
        try {
          return createInvoiceObject(orderId, zhInvoice);
        } catch (error) {
          console.error('Error processing invoice:', error);
          return null;
        }
      })
      .filter((invoice) => invoice !== null); // Remove any null entries from failed processing

    return processedInvoices || []; // Ensure we always return an array
  } catch (error) {
    console.error('Unexpected error in getInvoices:', error);
    return [];
  }
};

/**
 * Fetches modified invoices from Zoho and stores them in the ZhInvoices collection
 * @returns {Object} Object containing success and error responses
 */
const getInvoicesFromZohoByLastModifiedTime = new ValidatedMethod({
  name: 'invoices.getInvoicesFromZohoByLastModifiedTime',
  validate() {
    // No validation needed as this is an admin-only method
  },
  async run() {
    // Check if user is admin
    const isAdmin = await Roles.userIsInRoleAsync(
      this.userId,
      constants.Roles.admin.name,
    );
    if (!isAdmin) {
      handleAccessDenied();
    }

    const nowDate = new Date();
    const successResp = [];
    const errorResp = [];

    if (Meteor.isServer) {
      try {
        // Get the last sync time for invoices
        const lastSync = await ZohoSyncUps.findOneAsync(
          { syncEntity: syncUpConstants.invoicesLastModifiedTimeFromZoho },
          { sort: { syncDateTime: -1 } }
        );

        // Format the last sync time for Zoho API (add 1ms to avoid getting the same record again)
        let lastSyncTime = null;
        if (lastSync) {
          // Calculate 3 days before the last sync date
          const lastSyncDate = new Date(lastSync.syncDateTime);
          const threeDaysAgo = new Date(lastSyncDate.getTime() - (3 * 24 * 60 * 60 * 1000));
          // Format the date with timezone offset
          lastSyncTime = moment(threeDaysAgo).add(1, 'millisecond').format('YYYY-MM-DDTHH:mm:ss+0530');
          // Manually encode the plus sign in the timezone offset
          // lastSyncTime = formattedDate.replace('+', '%2B');
        }
        
        // Prepare parameters for the Zoho API call
        const params = {
          per_page: 200, // Maximum allowed by Zoho
        };
        
        if (lastSyncTime) {
          params.last_modified_time = lastSyncTime;
        }

        console.log(`Fetching invoices modified since ${lastSyncTime || 'beginning of time'}`);
        
        // Get invoices from Zoho
        const response = await zh.getRecordsByParams('invoices', params);

        if (response.code === 0 && response.invoices && response.invoices.length > 0) {
          const invoiceCount = response.invoices.length;
          console.log(`Found ${invoiceCount} modified invoices since ${lastSyncTime || 'beginning of time'}`);
          
          // Process and store all invoices in ZhInvoices collection
          try {
            // Format the invoices to ensure they match our schema
            const formattedInvoices = response.invoices.map(invoice => ({
              ...invoice,
              // Store customer information without email
              customer: {
                name: invoice.customer_name || invoice.customer?.name || 'Unknown Customer',
                id: invoice.customer_id || invoice.customer?.id || 'unknown',
              },
              // Ensure required fields are present
              reference_number: invoice.reference_number || '',
              status: invoice.status || 'draft',
              total: parseFloat(invoice.total) || 0,
              date: invoice.date ? new Date(invoice.date) : new Date(),
              // Add the new fields
              balance: typeof invoice.balance !== 'undefined' ? parseFloat(invoice.balance) : undefined,
              created_time: invoice.created_time ? new Date(invoice.created_time) : undefined,
              last_modified_time: invoice.last_modified_time ? new Date(invoice.last_modified_time) : undefined,
              invoice_number: invoice.invoice_number || undefined,
              due_date: invoice.due_date ? new Date(invoice.due_date) : undefined,
              // Process line items
              line_items: (invoice.line_items || []).map(item => ({
                item_id: item.item_id || '',
                name: item.name || '',
                quantity: parseFloat(item.quantity) || 0,
                rate: parseFloat(item.rate) || 0,
                total: parseFloat(item.item_total || item.total || 0),
              }))
            }));
            
            const storageResult = await bulkUpsertZhInvoices.call({
              invoices: formattedInvoices
            });
            
            console.log(`Stored ${storageResult.success} invoices in ZhInvoices collection`);
            if (storageResult.errors > 0) {
              console.error(`Failed to store ${storageResult.errors} invoices:`, storageResult.errorDetails);
            }
          } catch (storageError) {
            console.error('Error storing invoices in ZhInvoices collection:', storageError);
            // Continue processing even if storage fails
          }
          
          // Group invoices by sales order number for order processing
          const invoicesByOrder = {};
          response.invoices.forEach(invoice => {
            if (invoice.reference_number) {
              if (!invoicesByOrder[invoice.reference_number]) {
                invoicesByOrder[invoice.reference_number] = [];
              }
              invoicesByOrder[invoice.reference_number].push(invoice);
            }
          });

          // Process each order with all its invoices
          for (const [salesOrderNumber, invoices] of Object.entries(invoicesByOrder)) {
            try {
              // Find the order by sales order number
              const order = await Orders.findOneAsync({ 
                zh_salesorder_number: salesOrderNumber 
              });

              if (order) {
                try {
                  // First update the order status from Zoho
                  console.log('Updating order status from Zoho for sales order number:', salesOrderNumber);
                   await updateOrderStatusFromZoho(
                    order,
                    successResp,
                    errorResp
                  );
                  
                    await processInvoicesFromZoho(
                      order,
                      successResp,
                      errorResp,
                      invoices // Pass the pre-fetched invoices
                    );
                  
                } catch (error) {
                  console.error(`Error updating order status for ${salesOrderNumber}:`, error);
                  errorResp.push({
                    salesOrderNumber,
                    status: 'error',
                    message: `Error updating order status for ${salesOrderNumber}: ${error.message}`,
                  });
                }
              } else {
                console.log(`No order found for sales order number: ${salesOrderNumber}`);
                // Optionally handle invoices without matching orders
                successResp.push({
                  message: `Found ${invoices.length} invoices for non-existent order ${salesOrderNumber}`,
                  invoiceCount: invoices.length
                });
              }
            } catch (error) {
              console.error(`Error processing order ${salesOrderNumber}:`, error);
              errorResp.push({
                salesOrderNumber,
                status: 'error',
                message: `Error processing order ${salesOrderNumber}: ${error.message}`,
              });
            }
          }
          
          console.log(`Processed ${Object.keys(invoicesByOrder).length} orders with modified invoices`);
        } else {
          console.log('No modified invoices found since last sync');
        }

        // Update the last sync time to now
        const syncDateTime = new Date();
        const updateData = {
          $set: {
            syncDateTime: syncDateTime,
            updatedAt: syncDateTime
          }
        };
        
        // For existing documents, set syncedForUser in a separate operation if needed
        const existingDoc = await ZohoSyncUps.findOneAsync({
          syncEntity: syncUpConstants.invoicesLastModifiedTimeFromZoho
        });
        
        if (existingDoc) {
          // If the document exists, update syncedForUser in a separate operation
          // but only if it's not already set to 'All'
          if (existingDoc.syncedForUser !== 'All') {
            updateData.$set.syncedForUser = 'All';
          }
        }
        
        
        await ZohoSyncUps.updateAsync(
          { syncEntity: syncUpConstants.invoicesLastModifiedTimeFromZoho },
          updateData
        );
        console.log(`Updated invoicesLastModifiedTimeFromZoho sync time to: ${syncDateTime.toISOString()}`);

        // Format the response to match what ZohoSync component expects
        const formattedSuccess = successResp.map(msg => ({
          code: 'success',
          message: typeof msg === 'string' ? msg : (msg.message || 'Operation succeeded')
        }));
        
        const formattedError = errorResp.map(err => ({
          code: 'error',
          message: typeof err === 'string' ? err : (err.message || 'An error occurred')
        }));
        
        const result = {
          status: 'success',
          message: 'Invoice sync completed',
          // The ZohoSync component expects these specific property names
          success: formattedSuccess,
          error: formattedError,
          // Include additional stats
          stats: {
            totalInvoices: response.invoices?.length || 0,
            successCount: formattedSuccess.length,
            errorCount: formattedError.length,
          },
          // Keep the original responses for reference
          originalSuccess: successResp,
          originalError: errorResp,
        };
        
        console.log('Sync completed with results:', result);
        return result;
      } catch (error) {
        console.error('Error in getInvoicesFromZohoByLastModifiedTime:', error);
        throw new Meteor.Error('sync-failed', `Failed to sync invoices: ${error.message}`);
      }
    }
  },
});

/**
 * Determines the appropriate order status based on invoice statuses
 * @param {Array} invoices - Array of invoice objects
 * @returns {string|null} - The determined order status or null if no status can be determined
 */
const determineOrderStatusFromInvoices = (invoices) => {
  if (!Array.isArray(invoices) || invoices.length === 0) {
    console.log('No invoices provided to determineOrderStatusFromInvoices');
    return null;
  }

  // Define status mapping exactly as requested by user
  const statusMapping = {
    'paid': constants.OrderStatus.Completed.name,
    'unpaid': constants.OrderStatus.Awaiting_Payment.name,
    'overdue': constants.OrderStatus.Awaiting_Payment.name,
    'partially_paid': constants.OrderStatus.Partially_Completed.name,
    'sent': constants.OrderStatus.Shipped.name,
    'viewed': null, // Don't change status for viewed invoices
    'draft': null,  // Don't change status for draft invoices
  };

  // Get all unique statuses from invoices
  const invoiceStatuses = invoices
    .map(invoice => invoice.status)
    .filter(status => status && statusMapping.hasOwnProperty(status));

  if (invoiceStatuses.length === 0) {
    console.log(`No valid invoice statuses found among: ${invoices.map(inv => inv.status).join(', ')}`);
    return null;
  }

  console.log(`Found invoice statuses: ${invoiceStatuses.join(', ')}`);

  // NEW LOGIC: If any invoice is unpaid, overdue, or partially_paid, set order to Awaiting_Payment
  if (invoiceStatuses.includes('unpaid') || invoiceStatuses.includes('overdue') || invoiceStatuses.includes('partially_paid')) {
    console.log('Found unpaid, overdue, or partially_paid invoices, setting order status to Awaiting_Payment');
    return constants.OrderStatus.Awaiting_Payment.name;
  }

  // If any invoice is sent, set order to Shipped
  if (invoiceStatuses.includes('sent')) {
    console.log('Found sent invoices, setting order status to Shipped');
    return constants.OrderStatus.Shipped.name;
  }

  // Priority order for remaining statuses: paid > other
  const priorityOrder = ['paid'];

  // Find the highest priority status
  for (const priorityStatus of priorityOrder) {
    if (invoiceStatuses.includes(priorityStatus)) {
      const mappedStatus = statusMapping[priorityStatus];
      if (mappedStatus) {
        console.log(`Mapping invoice status '${priorityStatus}' to order status '${mappedStatus}'`);
        return mappedStatus;
      }
    }
  }

  console.log('No matching status found in priority order');
  return null;
};

/**
 * Processes invoices for a specific order and updates the order status accordingly
 * @param {Object} order - The order to process invoices for
 * @param {Array} [successResp=[]] - Array to collect success responses
 * @param {Array} [errorResp=[]] - Array to collect error responses
 * @param {Array} [prefetchedInvoices=null] - Optional pre-fetched invoices for this order
 * @returns {Promise<void>}
 */
const processInvoicesFromZoho = async (
  order,
  successResp = [],
  errorResp = [],
  prefetchedInvoices = null
) => {
  if (!order || !order._id) {
    const errorMsg = 'Invalid order object provided to processInvoicesFromZoho';
    console.error(errorMsg);
    errorResp.push({
      status: 'error',
      message: errorMsg,
      orderId: order?._id || 'unknown',
      salesOrderNumber: order?.zh_salesorder_number || 'unknown',
    });
    return;
  }

  const orderId = order._id;
  const salesOrderNumber = order.zh_salesorder_number || 'unknown';
  
  try {
    let zhInvoices = prefetchedInvoices;
    
    // If invoices not provided, fetch them using the sales order number
    if (!zhInvoices && salesOrderNumber !== 'unknown') {
      console.log(`Fetching invoices for order ${salesOrderNumber} from Zoho`);
      
      try {
        const response = await zh.getRecordsByParams('invoices', {
          reference_number_contains: salesOrderNumber,
        });
        
        if (response?.code === 0 && Array.isArray(response.invoices)) {
          zhInvoices = response.invoices;
          
          // Process and store the fetched invoices in our collection
          if (zhInvoices.length > 0) {
            try {
              // Format the invoices to ensure they match our schema
              const formattedInvoices = zhInvoices.map(invoice => ({
                ...invoice,
                // Store customer information without email
                customer: {
                  name: invoice.customer_name || invoice.customer?.name || 'Unknown Customer',
                  id: invoice.customer_id || invoice.customer?.id || 'unknown',
                },
                // Ensure required fields are present
                reference_number: invoice.reference_number || '',
                status: invoice.status || 'draft',
                total: parseFloat(invoice.total) || 0,
                date: invoice.date ? new Date(invoice.date) : new Date(),
                // Add the new fields
                balance: typeof invoice.balance !== 'undefined' ? parseFloat(invoice.balance) : undefined,
                created_time: invoice.created_time ? new Date(invoice.created_time) : undefined,
                last_modified_time: invoice.last_modified_time ? new Date(invoice.last_modified_time) : undefined,
                invoice_number: invoice.invoice_number || undefined,
                due_date: invoice.due_date ? new Date(invoice.due_date) : undefined,
                // Process line items
                line_items: (invoice.line_items || []).map(item => ({
                  item_id: item.item_id || '',
                  name: item.name || '',
                  quantity: parseFloat(item.quantity) || 0,
                  rate: parseFloat(item.rate) || 0,
                  total: parseFloat(item.item_total || item.total || 0),
                }))
              }));
              
              await bulkUpsertZhInvoices.call({ invoices: formattedInvoices });
              console.log(`Stored ${formattedInvoices.length} invoices for order ${salesOrderNumber} in ZhInvoices collection`);
            } catch (storageError) {
              console.error(`Error storing invoices for order ${salesOrderNumber}:`, storageError);
              // Continue processing even if storage fails
            }
          } else {
            console.log(`No invoices found in Zoho for order ${salesOrderNumber}`);
          }
        } else {
          console.log(`No valid invoice data received from Zoho for order ${salesOrderNumber}`);
          zhInvoices = [];
        }
      } catch (fetchError) {
        console.error(`Error fetching invoices from Zoho for order ${salesOrderNumber}:`, fetchError);
        throw new Error(`Failed to fetch invoices: ${fetchError.message}`);
      }
    } else if (!zhInvoices) {
      console.log('No sales order number found for order, cannot fetch invoices');
      zhInvoices = [];
    }

    // Process the invoices
    if (Array.isArray(zhInvoices) && zhInvoices.length > 0) {
      console.log(`Processing ${zhInvoices.length} invoices for order ${salesOrderNumber}`);
      
      const invoiceIds = zhInvoices.map((invoice) => invoice.invoice_id).filter(Boolean);
      const now = new Date();

      // Determine new order status based on invoice statuses
      const newOrderStatus = determineOrderStatusFromInvoices(zhInvoices);
      console.log(`Determined order status '${newOrderStatus}' based on invoice statuses for order ${salesOrderNumber}`);

      // Prepare the order update
      const update = {
        $set: {
          zh_invoice_ids: invoiceIds,
          updatedAt: now,
          lastSyncTime: now,
        },
        $addToSet: {
          zh_invoice_history: {
            $each: getInvoices(orderId, zhInvoices),
          },
        },
      };

      // Add order status update if determined and different from current status
      if (newOrderStatus && newOrderStatus !== order.order_status) {
        update.$set.order_status = newOrderStatus;
        console.log(`Will update order ${salesOrderNumber} status from '${order.order_status}' to '${newOrderStatus}'`);
      } else if (newOrderStatus) {
        console.log(`Order ${salesOrderNumber} already has status '${newOrderStatus}', no update needed`);
      } else {
        console.log(`No order status determined for ${salesOrderNumber}, keeping current status: ${order.order_status}`);
      }

      // Update the order in the database
      try {
        const result = await Orders.updateAsync({ _id: orderId }, update);
        
        if (result > 0) {
          console.log(`Successfully updated order ${salesOrderNumber} with ${zhInvoices.length} invoices and status: ${newOrderStatus || order.order_status}`);
          const actualStatus = newOrderStatus || order.order_status;
          successResp.push({
            orderId,
            salesOrderNumber,
            status: 'success',
            message: `Updated order with ${zhInvoices.length} invoices${newOrderStatus ? ` and status to ${newOrderStatus}` : ` (status remains ${actualStatus})`}`,
            invoiceCount: zhInvoices.length,
            updatedAt: now,
            finalStatus: actualStatus,
          });
        } else {
          throw new Error('No documents were updated - order not found or no changes made');
        }
      } catch (updateError) {
        console.error(`Error updating order ${salesOrderNumber} in database:`, updateError);
        throw new Error(`Failed to update order: ${updateError.message}`);
      }
    } else {
      console.log(`No invoices to process for order ${salesOrderNumber}`);
      successResp.push({
        orderId,
        salesOrderNumber,
        status: 'success',
        message: 'No invoices to process',
        orderStatus: order.order_status || 'pending',
      });
    }
  } catch (error) {
    const errorMsg = `Error processing invoices for order ${salesOrderNumber}: ${error.message}`;
    console.error(errorMsg, error);
    errorResp.push({
      orderId,
      salesOrderNumber,
      status: 'error',
      message: errorMsg,
      error: error.toString(),
      stack: error.stack,
    });
  };
};

export {
  processInvoicesFromZoho,
  getInvoicesFromZohoByLastModifiedTime,
  
  // Helper functions
  getInvoices,
  createInvoiceObject,
  
  // New status determination function
  determineOrderStatusFromInvoices
};


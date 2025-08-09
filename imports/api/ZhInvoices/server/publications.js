import { Meteor } from 'meteor/meteor';
import { ZhInvoices } from '../ZhInvoices';

Meteor.publish('zhinvoices.byUser', function(userId) {
  if (!this.userId) {
    return this.ready();
  }

  // Get the target user's zh_contact_id
  const user = Meteor.users.findOne(userId, {
    fields: { zh_contact_id: 1 }
  });
  
  const zhContactId = user?.zh_contact_id;
  
  if (!zhContactId) {
    console.log('No zh_contact_id found for user', userId);
    return this.ready();
  }

  // Convert to string if it's a number, otherwise use as is
  const contactId = typeof zhContactId === 'number' ? zhContactId.toString() : zhContactId;

  // Return invoices where customer.id matches the user's zh_contact_id
  return ZhInvoices.find({
    'customer.id': contactId
  }, {
    sort: { date: -1 }, // Most recent first
    limit: 1000, // Reasonable limit to prevent performance issues
    fields: {
      invoice_id: 1,
      reference_number: 1,
      date: 1,
      status: 1,
      total: 1,
      balance: 1,
      'customer.name': 1,
      'customer.email': 1,
      'customer.id': 1,
      line_items: 1,
      notes: 1,
      terms: 1,
      created_time: 1,
      last_modified_time: 1,
      due_date: 1,
      invoice_number: 1
    }
  });
});

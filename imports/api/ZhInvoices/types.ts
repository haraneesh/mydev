// Type definitions for Zoho Invoice
export interface IZohoInvoiceLineItem {
  item_id: string;
  name: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface IZohoCustomer {
  email: string;
  name?: string;
  id?: string;
}

export interface IZohoInvoice {
  _id?: string;
  invoice_id: string;
  reference_number?: string;
  date: Date | string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void' | 'unpaid' | 'partially_paid';
  total: number;
  customer: IZohoCustomer;
  line_items?: IZohoInvoiceLineItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

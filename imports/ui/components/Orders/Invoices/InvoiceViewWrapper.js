import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';
import ViewInvoice from './ViewInvoice';

import Loading from '/imports/ui/components/Loading/Loading';


export const InvoiceViewWrapper = (props) => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Use Meteor.callAsync for cleaner async/await pattern
      const result = await Meteor.callAsync('zhInvoices.getInvoiceById', { invoiceId: id });
      setInvoice(result);
    } catch (err) {
      console.error('Error fetching invoice:', err);
      const errorMessage = err.reason || 'Failed to load invoice. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
    };

    if (id) {
      fetchInvoice();
    }
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!invoice) {
    return <div className="alert alert-warning">Invoice not found</div>;
  }

  return (
    <div className="container-fluid">
      <ViewInvoice invoice={invoice} {...props} />
   </div>);
};

export default InvoiceViewWrapper;

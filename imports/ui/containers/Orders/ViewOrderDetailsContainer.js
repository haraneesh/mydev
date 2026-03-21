import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Orders } from '../../../api/Orders/Orders';
import ViewOrderDetails from '../../components/Orders/ViewOrderDetails';
import Loading from '../../components/Loading/Loading';

const ViewOrderDetailsContainer = () => {
  const { _id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await new Promise((resolve, reject) => {
          Meteor.call('orders.getOrderDetails', { orderId: _id }, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [_id]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!order) {
    return <div className="alert alert-warning">Order not found</div>;
  }

  return <ViewOrderDetails order={order} />;
};

export default ViewOrderDetailsContainer;

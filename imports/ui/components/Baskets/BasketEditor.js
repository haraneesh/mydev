import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Panel, Button } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';

const BasketEditor = ({ history, existingBasket }) => {
  const handleSaveBasket = () => {
    const methodToCall = existingBasket._id ? 'baskets.update' : 'baskets.insert';
    const basket = {
      name: 'Healthy Basket',
      products: [
        {
          _id: '1',
          quantity: '12',
        },
        {
          _id: '2',
          quantity: '10',
        },
      ] };

    Meteor.call(methodToCall, basket, (error, basketId) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const confirmation = existingBasket._id ? 'Basket is updated!' : 'Basket is created!';
        Bert.alert(confirmation, 'success');
        history.push(`/baskets/${basketId}`);
      }
    });
  };

  // CSS for getting hover state
  return (
    <div>
      <Row>
        <Col xs={12}>
          <h3 className="page-header">{ existingBasket._id ? 'Update Basket' : 'New Basket' }</h3>
        </Col>
        <Col xs={12}>
          <Panel>
            <Row>
              { existingBasket._id }
            </Row>
            {/* <ListProducts products={cartState.cart.productsInCart} deletedProducts={deletedProducts.cart} updateProductQuantity={updateProductQuantity} isMobile isAdmin={isLoggedInUserAdmin()} /> */}
            <Row>
              <Col xsOffset={2} xs={8} className="text-right">
                <Button className="btn-block" style={{ marginBottom: '2.5em', marginRight: '.5em' }} onClick={() => { handleSaveBasket(); }}>Save Basket</Button>
              </Col>
            </Row>
          </Panel>
        </Col>
      </Row>
    </div>
  );
};

BasketEditor.defaultProps = {
  existingBasket: {},
};

BasketEditor.propTypes = {
  history: PropTypes.object.isRequired,
  existingBasket: PropTypes.object,
};

export default BasketEditor;

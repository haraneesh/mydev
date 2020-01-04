import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Panel, Button } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import { cartActions, useCartState, useCartDispatch } from '../../stores/ShoppingCart';

const ConfirmOrderPlaced = ({ history, orderId, loggedUserId }) => {
  const cartState = useCartState();
  const cartDispatch = useCartDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  return (
    <Row className="text-center">
      <Col xs={12} />
      <Panel>
        <Row>
          <Col xs={12}>
            <h3 className="page-header">Your Order Has Been Placed</h3>
          </Col>

          <Col xs={12}>
            Dear {loggedUserId}, <br />

            <ul>By ordering on Suvai, you </ul>

            <ol> Eating Healthy by

              <li>avoiding highly processed and refined food</li>
              <li>eating food that has NO pesticides, artificial colors, preservatives</li>
            </ol>

            <ol> Doing your bit for the planet by
              <li>supporting rural economy</li>
              <li>supporting local ecosystem</li>
              <li>reducing your overall carbon foot print</li>
            </ol>

          </Col>
        </Row>
      </Panel>
    </Row>
  );
};

ConfirmOrderPlaced.defaultProps = {
  loggedUserId: Meteor.userId(),
};

ConfirmOrderPlaced.propTypes = {
  history: PropTypes.object.isRequired,
  orderId: PropTypes.string.isRequired,
  loggedUserId: PropTypes.string,
};

export default ConfirmOrderPlaced;

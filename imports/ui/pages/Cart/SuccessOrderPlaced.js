import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Panel, Alert, Button, PanelGroup } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import { cartActions, useCartState, useCartDispatch } from '../../stores/ShoppingCart';

const SuccessOrderPlaced = ({ history, orderId, loggedUserId }) => {
  const cartState = useCartState();
  const cartDispatch = useCartDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="OrderPlaced page-header">
      <Panel className="text-center" >
        <Alert bsStyle="primary" style={{ borderLeftWidth: '0px' }}>
          <h1 className="text-success" style={{ fontSize: '2.5em' }}>
            <i className="fas fa-check-circle" aria-hidden="true" /> </h1>
          <h4 className="text-success">You order has been placed</h4>
        </Alert>
        <Alert style={{ borderLeftWidth: '0px' }}>
          <Row>
            <p>By ordering on Suvai, you </p>
            <Col xs={4}>
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
            <Col xs={8}> </Col>
          </Row>
        </Alert>
      </Panel>
    </div>
  );
};

SuccessOrderPlaced.defaultProps = {
  loggedUserId: Meteor.userId(),
};

SuccessOrderPlaced.propTypes = {
  history: PropTypes.object.isRequired,
  orderId: PropTypes.string.isRequired,
  loggedUserId: PropTypes.string,
};

export default SuccessOrderPlaced;

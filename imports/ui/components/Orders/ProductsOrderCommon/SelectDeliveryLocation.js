import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { cartActions, useCartState, useCartDispatch } from '../../../stores/ShoppingCart';

const SelectDeliveryLocation = ({ history, loggedInUser }) => {
  const cartState = useCartState();
  const cartDispatch = useCartDispatch();
  const [showModal, setShowModal] = useState(true);
  const selectedDeliveryPincode = (cartState.cart.deliveryPincode) ? cartState.cart.deliveryPincode : '';
  const [pincodeDetails, setIsPinCodeValid] = useState({ pincode: selectedDeliveryPincode, pincodeErrorMsg: '' });

  useEffect(() => {
    setShowModal(!cartState.cart.deliveryPincode);
  });

  const validPinCode = (pincode) => {
    const pinCodeTest = RegExp(/^[1-9][0-9]{5}$/);
    return pinCodeTest.test(pincode);
  };

  const validatePincode = (pincode) => {
    // Match against the pincode format (6 digits)

    if (!validPinCode(pincode)) {
      setIsPinCodeValid({ pincode, pincodeErrorMsg: 'Pincode has to have 6 digits only' });
      document.getElementById('inpPinCode').focus();
    } else {
      setIsPinCodeValid({ pincode, pincodeErrorMsg: '' });
    }
  };

  const setDeliveryLocation = () => {
    validatePincode(pincodeDetails.pincode);
    if (validPinCode(pincodeDetails.pincode)) {
      cartDispatch({
        type: cartActions.setDeliveryPinCode,
        payload: { deliveryPincode: pincodeDetails.pincode },
      });
      setShowModal(false);
      if (loggedInUser) {
        Meteor.call('user.updateDeliveryPincode', { deliveryPincode: pincodeDetails.pincode });
      }
    }
  };

  return (
    <>
      <Modal show={showModal}>
        <Modal.Header>
          <Modal.Title className="fw-bold fs-4">Select Delivery Address Pincode</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <div className="text-center">
              <p>At the moment we are able to deliver fresh produce only within Chennai.</p>
            </div>
            <label className="fw-semibold fs-4 col-form-label">Pin Code</label>
            <div className="row">
              <div className="col-9">
                <input id="inpPinCode" className="form-control" type="number" placeholder="600087" onBlur={(e) => { validatePincode(e.target.value); }} />
              </div>
              <div className="col">
                <Button
                  variant="primary"
                  onClick={setDeliveryLocation}
                >
                  {(loggedInUser && loggedInUser.profile) ? 'Update profile' : 'Done'}
                </Button>
              </div>
              {pincodeDetails.pincodeErrorMsg.length > 0 && (
                <span className="small text-danger">{pincodeDetails.pincodeErrorMsg}</span>
              )}
            </div>
          </>

          <hr />

          {(!loggedInUser) && (
          <div className="row text-center">
            <div className="col">
              <span className="pe-2">
                Already a Suvai Member?
              </span>

              <Button
                variant="secondary"
                onClick={() => { history.push('/login'); }}
              >
                Log in
              </Button>
            </div>
          </div>
          )}

        </Modal.Body>
      </Modal>
    </>
  );
};

SelectDeliveryLocation.propTypes = {
  history: PropTypes.object.isRequired,
};

export default SelectDeliveryLocation;


import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';
import { formValChange } from '/imports/modules/validate';

function GetUserPhoneNumber({handlePlaceOrder, showMobileNumberForm, handleClose}){
    const navigate = useNavigate();
    const [isError, setErrorState] = useState({whMobilePhone:''});
    const [userEnteredPhoneNumber, setUserEnteredPhoneNumber] = useState('');

    function onValueChange(e){
        e.preventDefault();
        setErrorState({whMobilePhone:''});
        setUserEnteredPhoneNumber(e.target.value);
    }
    function handleEnterPhoneNumber(e){
      e.preventDefault();
      const err = formValChange(
        {target:{
            name:'whMobilePhone',value:userEnteredPhoneNumber
        }},isError).isError;
      if (err.whMobilePhone.length > 0) {
        setErrorState(err);   
        return;
      }
      
      const phoneNumber = userEnteredPhoneNumber;
      if (phoneNumber) {
        Meteor.call('usersNotLoggedIn.find', { mobileNumber: phoneNumber }, (error, user) => {
          if (error) {
            console.log(error);
          }
          if (user){
             handlePlaceOrder({userId: user._id});
          } else {
            setErrorState({whMobilePhone:'If you are a new to Suvai, please sign up. This mobile number is not registered with us.'});  
          }
        });
      }
    }

    return (
        <Modal show={showMobileNumberForm} className="modalFeedBack" onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Complete Order</Modal.Title>
          </Modal.Header>
        <Modal.Body>
          <Row>
            <Col xs={12}>
              <p><h7>Enter Your Registered Mobile Number</h7></p>
              <input 
              type="number" 
              name="whMobilePhone" 
              placeholder="10 digit number example, 8787989897" 
              className="form-control" 
              onChange={onValueChange} />
               {isError.whMobilePhone.length > 0 && (
                <span className="bg-white text-danger">
                  {isError.whMobilePhone}
                </span>
              )}
              <br />
              <Button onClick={handleEnterPhoneNumber} variant="secondary"> 
                Place Order
             </Button>
            </Col>
          </Row>
          <hr />
          <Row>
            <Col xs={12}>
            <p><h7> If you are a new user, please sign up </h7></p>
            <Button onClick={()=>{navigate('/signup')}} variant="primary"> 
                Sign Up
             </Button>
             </Col>
          </Row>
        </Modal.Body>
    </Modal>
    )
}

GetUserPhoneNumber.propTypes = {
    handlePlaceOrder: PropTypes.func.isRequired,
  };

export default GetUserPhoneNumber;
import React from 'react';
import { Row, Col, FormGroup, Panel, Checkbox, ControlLabel, FormControl, Button } from 'react-bootstrap';
import '../../../modules/validation'
import constants from '../../../modules/constants'
import { Roles } from 'meteor/alanning:roles'

export const findUserForm = (callBack) =>{
   return(
          <Row>
              <Col xs={ 12 } sm = { 6 }>
                  <FormGroup>
                    <ControlLabel>User's Phone number</ControlLabel>
                    <FormControl
                      type="text"
                      ref="mobileNumber"
                      name="mobileNumber"
                      placeholder="User's mobile phone number"
                    />
                  </FormGroup>
                   <Button type="button" bsStyle="default" onClick = { callBack }>Find User</Button>
                </Col>
            </Row>  
      )
}


 export const userProfileForm = (user) => {
    return (<div className="updateProfile">
        <h4> {(user)?"Edit User Info":"Add New User"} </h4>
         <form onSubmit={ (event) => { event.preventDefault() } } key = { (user) ? user.username : "new" } 
            name="updateProfileForm" 
            className="userProfileForm">
            <Panel>
            <Row>
              <Col xs={ 12 } sm={ 6 }>
              <Row>
                  <Col xs={ 6 } sm={ 6 }>
                    <FormGroup>
                      <ControlLabel>First Name</ControlLabel>
                      <FormControl
                        type="text"
                        ref="firstName"
                        name="firstName"
                        placeholder="First Name"
                        defaultValue = { (user) ? user.profile.name.first:"" }
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={ 6 } sm={ 6 }>
                    <FormGroup>
                      <ControlLabel>Last Name</ControlLabel>
                      <FormControl
                        type="text"
                        ref="lastName"
                        name="lastName"
                        placeholder="Last Name" 
                        defaultValue = { (user) ? user.profile.name.last:"" }
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <FormGroup>
                  <ControlLabel>Email Address</ControlLabel>
                  <FormControl
                    type="text"
                    ref="emailAddress"
                    name="emailAddress"
                    placeholder="Email Address" 
                    defaultValue = { (user) ? user.emails[0].address:"" }
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Mobile Number</ControlLabel>
                  <FormControl
                    type="text"
                    ref="whMobilePhone"
                    name="whMobilePhone"
                    placeholder="10 digit number example, 8787989897" 
                    defaultValue = { (user) ? user.profile.whMobilePhone:"" }
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Delivery Address</ControlLabel>
                  <FormControl
                    componentClass="textarea"
                    ref="deliveryAddress"
                    name="deliveryAddress"
                    placeholder="Complete address to deliver at, including Landmark, Pincode." 
                    rows="6"
                    defaultValue = { (user && user.profile.deliveryAddress) ? user.profile.deliveryAddress:"" }
                  />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Password</ControlLabel>
                    <FormControl
                      type="password"
                      ref="password"
                      name="password"
                      placeholder="Password"
                    />      
                </FormGroup>
                <FormGroup>
                   <Checkbox name="checkBoxIsAdmin" defaultChecked = { (user) && user.isAdmin }  >
                    {constants.Roles.admin.display_value}
                  </Checkbox>
                </FormGroup>
              </Col>
            </Row>
          <Button type="submit" bsStyle="primary"> { (user)? "Update Profile":"Add New User" } </Button>
          </Panel>
         </form>
         
      </div>
    )
  }

 export const getUserData = () => {
     const password = document.querySelector('[name="password"]').value
     
     return ({  
      username: document.querySelector('input[name="whMobilePhone"]').value,
      email: document.querySelector('[name="emailAddress"]').value,
      password: (password)?Accounts._hashPassword( password ) : null,
      profile: {
        name: {
          first: document.querySelector('[name="firstName"]').value,
          last: document.querySelector('[name="lastName"]').value,
        },
        whMobilePhone:document.querySelector('input[name="whMobilePhone"]').value,
        deliveryAddress:document.querySelector('[name="deliveryAddress"]').value,
      },
      isAdmin: $('[name="checkBoxIsAdmin"]')[0].checked
    });
  }

 export const hookUpValidation = (callBack) => {
    $(".userProfileForm").validate({
        rules: {
          firstName: {
            required: true,
          },
          lastName: {
            required: true,
          },
          emailAddress: {
            required: true,
            email: true,
          },
          password: {
            required: false,
            minlength: 6,
          },
          whMobilePhone:{
            required:true,
            indiaMobilePhone:true,
          },
          deliveryAddress:{
            required:true,
          }
        },
        messages: {
          firstName: {
            required: 'First name?',
          },
          lastName: {
            required: 'Last name?',
          },
          emailAddress: {
            required: 'Need an email address here.',
            email: 'Is this email address legit?',
          },
          password: {
            required: 'Need a password here.',
            minlength: 'Use at least six characters, please.',
          },
          whMobilePhone:{
            required: 'Need your mobile number.',
            indiaMobilePhone: 'Is this a valid India mobile number?'
          },
          deliveryAddress:{
            required: 'Need your delivery address.'
          }
       },
       submitHandler: function() { callBack() }
     });
 }


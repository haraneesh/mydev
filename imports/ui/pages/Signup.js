import React from 'react'
import { Link, browserHistory } from 'react-router'
import { Row, Col, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap'
import handleSignup from '../../modules/signup'
import { Meteor } from 'meteor/meteor'

export default class Signup extends React.Component {
  componentWillMount() {
    this.loggedInUser = Meteor.user()

    if (!(this.loggedInUser || (this.loggedInUser === null ))){
       browserHistory.push('/');//page is connecting to the backend
       return;
    }
  } 
  componentDidMount() {
    handleSignup({ component: this });
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    const loggedInUser = this.loggedInUser
    const title = (loggedInUser)? "Update Profile" : "Sign Up"

    return (
      <div className="Signup">
        <Row>
          <Col xs={ 12 } sm={ 6 } md={ 4 }>
            <h3 className="page-header">{ title }</h3>
            <form
              ref={ form => (this.signupForm = form) }
              onSubmit={ this.handleSubmit }
            >
              <Row>
                <Col xs={ 6 } sm={ 6 }>
                  <FormGroup>
                    <ControlLabel>First Name</ControlLabel>
                    <FormControl
                      type="text"
                      ref="firstName"
                      name="firstName"
                      placeholder="First Name"
                      defaultValue = { (loggedInUser) ? loggedInUser.profile.name.first:"" }
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
                      defaultValue = { (loggedInUser) ? loggedInUser.profile.name.last:"" }
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
                  defaultValue = { (loggedInUser) ? loggedInUser.emails[0].address:"" }
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Mobile Number</ControlLabel>
                <FormControl
                  type="text"
                  ref="whMobilePhone"
                  name="whMobilePhone"
                  placeholder="10 digit number example, 8787989897" 
                  defaultValue = { (loggedInUser) ? loggedInUser.profile.whMobilePhone:"" }
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
                   defaultValue = { (loggedInUser && loggedInUser.profile.deliveryAddress) ? loggedInUser.profile.deliveryAddress:"" }
                 />
              </FormGroup>
              { !loggedInUser && (<FormGroup>
                  <ControlLabel>Password</ControlLabel>
                  <FormControl
                    type="password"
                    ref="password"
                    name="password"
                    placeholder="Password"
                  />      
                </FormGroup>)
              }
              <Button type="submit" bsStyle="primary">{ title }</Button>
            </form>
            { !loggedInUser && (<p>Already have an account? <Link to="/login">Log In</Link>.</p>) }
          </Col>
        </Row>
      </div>
    );
  }
 }

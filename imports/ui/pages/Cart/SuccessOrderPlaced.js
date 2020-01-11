import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, ListItem, Panel, Alert, Button, PanelGroup } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import { cartActions, useCartState, useCartDispatch } from '../../stores/ShoppingCart';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const SuccessRow = ({text, iconName}) => {
  return (
    <div className="text-left">
    <div className="panel-body" style={{display: 'flex', alignItems: 'center'}}>
      <Col xs={3} className='text-right' style={{paddingLeft:'0px'}}>
      <img style={{maxHeight:'4em'}} src={`/success/${iconName}.png`} alt="" />
      </Col>
      <Col xs={9} style={{paddingRight:'0px'}}> 
          <p style={{margin:'0px'}}>  {text} </p>
      </Col>
    </div>
    </div>
  )
}

const SuccessOrderPlaced = ({ history, orderId, loggedInUser }) => {
  const cartState = useCartState();
  const cartDispatch = useCartDispatch();
  const profile = loggedInUser.profile;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  
  return (
    <div className="OrderPlaced page-header" style={{marginTop:'0px'}}>

<h1 className="text-success" style={{ fontSize: '2.5em', top: '25px', position: 'relative' }}>
            <i className="fas fa-check-circle" aria-hidden="true" /> </h1>

      <div className= "panel panel-default">
        <div className= "panel-heading">
            <h4> Hello {` ${(profile.salutation)? profile.salutation: ""} ${capitalize(profile.name.first)},`} </h4>
            <h4 className="text-success">Thank you for Ordering on Suvai.</h4>
    
            
            
        </div>
        <div className="panel-body">
          <Col xs={12}>
          <h4> Congratulations for, doing Good</h4>
          <SuccessRow text={'Good for You - Choosing Nutrition rich wholesome food'} iconName={'food'} /> 
          {<SuccessRow text={'Good for You - Limiting highly processed and refined food'} iconName={'junk'}/> }
          <SuccessRow text={'Good for You - Avoiding pesticides, artificial colors and preservatives'} iconName={'safe'} />
          <SuccessRow text={'Good for Farmers - Supporting Rural Economy, through farmers and self help groups'} iconName={'rural'}/>
          <SuccessRow text={'Good for Earth - Promoting Sustainable living by doing your bit for the planet'} iconName={'sustainable'}/>
          </Col>
          </div>
      </div>
    </div>
  );
};

SuccessOrderPlaced.defaultProps = {
  loggedInUser: Meteor.user(),
};

SuccessOrderPlaced.propTypes = {
  history: PropTypes.object.isRequired,
  orderId: PropTypes.string.isRequired,
  loggedInUser: PropTypes.object,
};

export default SuccessOrderPlaced;

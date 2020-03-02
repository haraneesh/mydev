import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Col, Button } from 'react-bootstrap';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const SuccessRow = ({ heading, text, iconName }) => {
  return (
    <div className="text-left">
      <div className="panel-body" style={{ display: 'flex', alignItems: 'center' }}>
        <Col xs={3} className='text-right' style={{ paddingLeft: '0px' }}>
          <img style={{ maxHeight: '4em' }} src={`/success/${iconName}.png`} alt="" />
        </Col>
        <Col xs={9} style={{ paddingRight: '0px' }}>
          <b style={{ margin: '0px' }}>{heading} </b>
          <p style={{ margin: '0px' }}>  {text} </p>
        </Col>
      </div>
    </div>
  )
}

const SuccessOrderPlaced = ({ history, match: { params }, loggedInUser }) => {
  const profile = loggedInUser.profile;
  const orderId = params.orderId;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!orderId) {
    history.push('/');
  }
  return (
    <div className="OrderPlaced page-header" style={{ marginTop: '0px' }}>

      <h1 className="text-success" style={{ fontSize: '2.5em', top: '30px', position: 'relative' }}>
        <i className="fas fa-check-circle" aria-hidden="true" /> </h1>

      <div className="panel panel-default">
        <section className="panel-heading" style={{ paddingTop: '1.75em' }}>
          <h4> Hello {` ${(profile.salutation) ? profile.salutation : ""} ${capitalize(profile.name.first)},`} </h4>
          <h4 className="text-success">Thank you for Ordering on Suvai.</h4>
        </section>
        <section className="panel-body">
          <p> Next time, You can save on time by prefilling cart with this order. </p>
          <Button bsStyle="primary" onClick={() => { history.push(`/createBasket/${orderId}`) }}>Save Order To Prefill </Button>
        </section>
        <section className="panel-body">
          <Col xs={12}>
            <h4> Congratulations for doing Good</h4>
            <SuccessRow heading={'Good for You'} text={'Choosing Nutrition rich wholesome food'} iconName={'food'} />
            <SuccessRow heading={'Good for You'} text={'Limiting highly processed and refined food'} iconName={'junk'} />
            <SuccessRow heading={'Good for You'} text={'Avoiding pesticides, artificial colors and preservatives'} iconName={'safe'} />
            <SuccessRow heading={'Good for Farmers'} text={'Supporting Rural Economy, through farmers and self help groups'} iconName={'rural'} />
            <SuccessRow heading={'Good for Earth'} text={'Promoting Sustainable living by doing your bit for the planet'} iconName={'sustainable'} />
          </Col>
        </section>
      </div>
    </div>
  );
};

SuccessOrderPlaced.defaultProps = {
  loggedInUser: Meteor.user(),
};

SuccessOrderPlaced.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  loggedInUser: PropTypes.object,
};

export default SuccessOrderPlaced;
import React, { useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { Col, Button } from 'react-bootstrap';
import { Roles } from 'meteor/alanning:roles';
import { getDeliveryDay } from '../../../modules/helpers';
import constants from '../../../modules/constants';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const SuccessRow = ({ heading, text, iconName }) => (
  <div className="text-left">
    <div className="panel-body" style={{ display: 'flex', alignItems: 'center' }}>
      <Col xs={3} className="text-right" style={{ paddingRight: '10px' }}>
        <img style={{ maxHeight: '4em' }} src={`/success/${iconName}.png`} alt="" />
      </Col>
      <Col xs={9} style={{ paddingRight: '0px' }}>
        <b style={{ margin: '0px' }}>
          {heading}
          {' '}
        </b>
        <p style={{ margin: '0px' }}>
          {' '}
          {text}
          {' '}
        </p>
      </Col>
    </div>
  </div>
);

const RegisterInvitation = () => {
  Meteor.call('invitation.getInvitation', (error, getJoinLink) => {
    if (error) {
      const msg = encodeURI(`${Meteor.settings.public.MessageInvitation}`);
      window.open(`https://wa.me/?text=${msg}`);
    } else {
      const msg = encodeURI(`${Meteor.settings.public.MessageInvitation} ${getJoinLink}`);
      window.open(`https://wa.me/?text=${msg}`);
    }
  });
};

const SuccessOrderPlaced = ({ history, match: { params }, loggedInUser }) => {
  const { profile } = loggedInUser;
  const { orderId } = params;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!orderId) {
    history.push('/');
  }
  return (
    <div className="OrderPlaced page-header" style={{ marginTop: '0px' }}>

      <h1 className="text-success" style={{ fontSize: '2.5em', top: '30px', position: 'relative' }}>
        <i className="fas fa-check-circle" aria-hidden="true" />
        {' '}

      </h1>

      <div className="panel panel-default">
        <section className="panel-heading" style={{ paddingTop: '1.75em' }}>
          <h4>
            {' '}
            Hello
            {` ${(profile.salutation) ? profile.salutation : ''} ${capitalize(profile.name.first)},`}
          </h4>
          <h4 className="text-success">Thank you for Ordering on Suvai.</h4>

          <div>
            <p>
              {`Your order will be delivered on ${getDeliveryDay(new Date())}`}
              . You can pay us after delivery.
            </p>
          </div>
          <div>
            <p>
              To pay now, you can add to your wallet and
              we will deduct automatically.
            </p>
          </div>

          <Button bsStyle="success" onClick={() => { history.push('/mywallet'); }}>
            Add To Wallet
          </Button>
          <br />
          {' '}
          <br />
          {(Meteor.settings.public.ShowInviteButton) && (
          <div>
            <p>
              Help us spread the word. Let us do more good, together.
            </p>
            <Button
              bsStyle="primary"
              onClick={() => {
                RegisterInvitation();
              }}
            >
              Invite A Friend
            </Button>
          </div>
          )}
        </section>

        {/*
        <section className="panel-body">
          <p> Next time, You can save on time by prefilling cart with this order. </p>
          <Button bsStyle="default" onClick={() => { history.push(`/createBasket/${orderId}`); }}>Save Order To Prefill </Button>
        </section>
        */}

        {!Roles.userIsInRole(loggedInUser._id, constants.Roles.shopOwner.name) && (
          <section className="panel-body">
            <Col xs={12}>
              <h4> Congratulations for doing Good</h4>
              <SuccessRow heading="Good for You" text="Choosing Nutrition rich wholesome food" iconName="food" />
              <SuccessRow heading="Good for You" text="Limiting highly processed and refined food" iconName="junk" />
              <SuccessRow heading="Good for You" text="Avoiding pesticides, artificial colors and preservatives" iconName="safe" />
              <SuccessRow heading="Good for Farmers" text="Supporting Rural Economy, through farmers and self help groups" iconName="rural" />
              <SuccessRow heading="Good for Earth" text="Promoting Sustainable living by doing your bit for the planet" iconName="sustainable" />
            </Col>
          </section>
        )}

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

import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { Roles } from 'meteor/alanning:roles';
import { Navigate } from 'react-router-dom';
// import { getDeliveryDay } from '../../../modules/helpers';
import { toast } from 'react-toastify';
import { getOrderDetails } from '../../../api/Orders/methods';
import ViewOrderDetails from '../../components/Orders/ViewOrderDetails';
import ShowReturnables from '../../components/Orders/MyOrdersList/ShowReturnables';
import constants from '../../../modules/constants';
import Icon from '../../components/Icon/Icon';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const SuccessRow = ({ heading, text, iconName }) => (
  <div className="text-left">
    <div className="row my-4">
      <Col xs={3} className="text-right pe-3">
        <img style={{ maxHeight: '4em' }} src={`/success/${iconName}.png`} alt="" />
      </Col>
      <Col xs={9} className="pe-0">
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

const SuccessOrderPlaced = ({
   match: { params }, loggedInUser, productReturnables,
}) => {
  const profile  = (loggedInUser)?loggedInUser.profile : null;
  const { orderId } = params;
  const [order, setOrder] = useState({});

  if (!orderId) {
    return <Navigate to="/" />;
  }
  useEffect(() => {
    if (orderId) {
      getOrderDetails.call({ orderId }, (err, orderDetails) => {
        if (err) {
          toast.error(err.reason);
        } else {
          setOrder(orderDetails);
        }
        window.scrollTo(0, 0);
      });
    }
  }, [orderId]);

  return (
    <div className="OrderPlaced mt-0 pb-5 text-center mx-2">

      <h1 className="text-success" style={{ top: '30px', position: 'relative', zIndex: '1000' }}>
        <Icon icon="check_circle" style={{ fontSize: '1.5em' }} type="mt" />
      </h1>

      <div> 
        <section className="px-2 py-3 bg-white card" style={{ borderColor: '#e4dfdb' }}>
          <h4 className="py-2 pt-4">
            {' '}
            {profile && ` ${(profile.salutation) ? profile.salutation : ''} ${capitalize(profile.name.first)}, `}
            Thank you for Ordering on Suvai.
          </h4>

            <h4 className="py-2 pt-4">
              Depending on stock availability, your order will arrive today or tomorrow.
              </h4>
              <h4 className="py-2 pt-4">
              You can pay after delivery. 
            </h4>
         
          <br />

          {(Meteor.settings.public.ShowInviteButton) && (
          <div>
            <p>
              Help us spread the word. Let us do more good, together.
            </p>
            <Button
              variant="success"
              onClick={() => {
                RegisterInvitation();
              }}
            >
              Invite A Friend
            </Button>
          </div>
          )}
        </section>
        <section className="text-left">
          {/* order Summary */}
          {(order && order._id) && (<ViewOrderDetails order={order} history={history} heading="Order Summary" />)}
        </section>

        <section className="mb-4">
          {productReturnables && (<ShowReturnables productReturnables={productReturnables} />)}
        </section>

        {(
          <section className="card  text-center">
            <Col xs={12}>
              <div className="card-header p-4 mb-4">
                <h6>Congratulations for doing Good</h6>
              </div>
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
  match: PropTypes.object.isRequired,
  loggedInUser: PropTypes.object,
};

export default SuccessOrderPlaced;

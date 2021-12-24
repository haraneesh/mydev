import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Row, Col } from 'react-bootstrap';
import AcceptPay from '../../components/Payments/AcceptPay/AcceptPay';
import ListPayments from '../../components/Payments/ListPayments/ListPayments';
import Loading from '../../components/Loading/Loading';

const MyWallet = ({ loading, loggedInUser, userWallet }) => (!loading ? (
  <div className="MyWallet">
    <Row>
      <Col xs={12}>
        <h2 className="page-header">My Wallet</h2>
        <AcceptPay
          loggedInUser={loggedInUser}
          userWallet={userWallet}
        />
      </Col>
    </Row>
    <Row>
      <Col xs={12}>
        <ListPayments />
      </Col>
    </Row>
  </div>
) : <Loading />);

MyWallet.propTypes = {
  loading: PropTypes.bool.isRequired,
  loggedInUser: PropTypes.object.isRequired,
  userWallet: PropTypes.object.isRequired,
};

export default withTracker((args) => {
  const userWallet = Meteor.subscribe('users.userWallet');

  return {
    loading: !userWallet.ready(),
    loggedInUser: args.loggedInUser,
    userWallet: args.loggedInUser.wallet,
    history: args.history,
  };
})(MyWallet);

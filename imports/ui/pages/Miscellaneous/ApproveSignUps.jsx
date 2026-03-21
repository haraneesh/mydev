import React from 'react';
import { Meteor } from 'meteor/meteor';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { withTracker } from 'meteor/react-meteor-data';
import Loading from '../../components/Loading/Loading';
import UserSignUps from '../../../api/Users/UserSignUps';

class ApproveSignUps extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(usr, status) {
    const approveSuccessMessage = `User ${usr.profile.name.first} ${usr.profile.name.last} sign up request has been approved`;
    const rejectSuccessMessage = `User ${usr.profile.name.first} ${usr.profile.name.last} sign up request has been rejected`;

    Meteor.call('users.approveSignUp', usr._id, status, (error) => {
      if (error) {
        toast.error(error.reason);
      } else if (status === 'Approve') {
        toast.success(approveSuccessMessage);
      } else {
        toast.success(rejectSuccessMessage);
      }
    });
  }

  render() {
    const { loading } = this.props;
    const { userSignUps } = this.props;

    return (!loading ? (
      <div className="ShowUserSignUps p-4">

        <h2 className="py-4">Users Requested to Join Suvai</h2>

        { userSignUps.map((user) => (
          <Row className="user bg-body p-3 mb-3" key={user._id}>
            <Col xs={12}>
              Name:
              {' '}
              <strong>{`${user.profile.name.first} ${user.profile.name.last}`}</strong>
            </Col>
            <Col xs={12}>
              Created At:
              {' '}
              <strong>{user.createdAt}</strong>
            </Col>
            <Col xs={12}>
              Phone Number:
              {' '}
              <strong>{user.profile.whMobilePhone}</strong>
            </Col>
            <Col xs={12}>
              Email:
              {' '}
              <strong>{user.email}</strong>
            </Col>
            <Col xs={12}>
              Delivery Address:
              {' '}
              <strong>{user.profile.deliveryAddress}</strong>
            </Col>
            <Col xs={12}>
              Eating Healthy Means:
              {' '}
              <strong>{user.profile.eatingHealthyMeaning}</strong>
            </Col>
            <Col xs={12}>
              <Button variant="secondary" onClick={() => { this.handleSubmit(user, 'Approve'); }}> Approve </Button>
              {' '}
              <Button onClick={() => { this.handleSubmit(user, 'Reject'); }}> Reject </Button>
            </Col>
          </Row>
        ))}
      </div>
    ) : <Loading />);
  }
}

ApproveSignUps.propTypes = {
  loading: PropTypes.bool.isRequired,
  userSignUps: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default withTracker((args) => {
  const userSignUps = Meteor.subscribe('userSignUps.getUsers');

  return {
    loading: !userSignUps.ready(),
    userSignUps: UserSignUps.find({}).fetch(),
  };
})(ApproveSignUps);

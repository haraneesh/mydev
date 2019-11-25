import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Panel, Col, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Bert } from 'meteor/themeteorchef:bert';
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
        Bert.alert(error.reason, 'danger');
      } else if (status === 'Approve') {
        Bert.alert(approveSuccessMessage, 'success');
      } else {
        Bert.alert(rejectSuccessMessage, 'success');
      }
    },
);
  }

  render() {
    const loading = this.props.loading;
    const userSignUps = this.props.userSignUps;

    return (!loading ? <div className="ShowUserSignUps">
      <div className="page-header clearfix">
        <h3 className="pull-left">Users Requested to Join Suvai</h3>
      </div>

      { userSignUps.map(user => (
        <Panel className="user" >
          <Col xs={12}>Name: <strong>{`${user.profile.name.first} ${user.profile.name.last}`}</strong></Col>
          <Col xs={12}>Created At: <strong>{user.createdAt}</strong>
          </Col>
          <Col xs={12}>
            Phone Number: <strong>{user.profile.whMobilePhone}</strong>
          </Col>
          <Col xs={12}>
            Email: <strong>{user.email}</strong>
          </Col>
          <Col xs={12}>
            Delivery Address: <strong>{user.profile.deliveryAddress}</strong>
          </Col>
          <Col xs={12}>
            <Button bsStyle="primary" onClick={() => { this.handleSubmit(user, 'Approve'); }}> Approve </Button> &nbsp;
            <Button onClick={() => { this.handleSubmit(user, 'Reject'); }}> Reject </Button>
          </Col>
        </Panel>
        ),
      )
      }
    </div> : <Loading />);
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


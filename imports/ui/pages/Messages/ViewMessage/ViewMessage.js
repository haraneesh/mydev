import React from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar, ButtonGroup, Button } from 'react-bootstrap';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import Messages from '../../../../api/Messages/Messages';
import NotFound from '../../Miscellaneous/NotFound/NotFound';
import Loading from '../../../components/Loading/Loading';

const handleRemove = (messageId, history) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('messages.remove', messageId, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Message deleted!', 'success');
        history.push('/messages');
      }
    });
  }
};

const renderMessage = (msg, match, history) => (msg ? (
  <div className="ViewMessage">
    <div className="page-header clearfix">
      <h4 className="pull-left">{ msg && msg.message }</h4>
      <ButtonToolbar className="pull-right">
        <ButtonGroup bsSize="small">
          <Button onClick={() => history.push(`${match.url}/edit`)}>Edit</Button>
          <Button onClick={() => handleRemove(msg._id, history)} className="text-danger">
            Delete
          </Button>
        </ButtonGroup>
      </ButtonToolbar>
    </div>
    { msg && msg.message }
  </div>
) : <NotFound />);

const ViewMessage = ({ loading, msg, match, history }) => (
  !loading ? renderMessage(msg, match, history) : <Loading />
);

ViewMessage.propTypes = {
  loading: PropTypes.bool.isRequired,
  msg: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker(({ match }) => {
  const messageId = match.params._id;
  const subscription = Meteor.subscribe('messages.view', messageId);

  return {
    loading: !subscription.ready(),
    msg: Messages.findOne(messageId) || {},
  };
}, ViewMessage);

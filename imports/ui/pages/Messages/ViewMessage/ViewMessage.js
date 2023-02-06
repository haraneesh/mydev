import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';
import Messages from '../../../../api/Messages/Messages';
import NotFound from '../../Miscellaneous/NotFound/NotFound';
import Loading from '../../../components/Loading/Loading';

const handleRemove = (messageId, history) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('messages.remove', messageId, (error) => {
      if (error) {
        toast.error(error.reason);
      } else {
        toast.success('Message deleted!');
        history.push('/messages');
      }
    });
  }
};

const renderMessage = (msg, match, history) => (msg ? (
  <div className="ViewMessage">
    <div className="py-4 clearfix">
      <h4 className="pull-left">{ msg && msg.message }</h4>
      <Row className="pull-right">

        <Button onClick={() => history.push(`${match.url}/edit`)} size="sm">Edit</Button>
        <Button onClick={() => handleRemove(msg._id, history)} className="text-danger" size="sm">
          Delete
        </Button>

      </Row>
    </div>
    { msg && msg.message }
  </div>
) : <NotFound />);

const ViewMessage = ({
  loading, msg, match, history,
}) => (
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

import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Messages from '../../../../api/Messages/Messages';
import MessageEditor from '../../../components/Messages/MessageEditor';
import NotFound from '../../Miscellaneous/NotFound/NotFound';

const EditMessage = ({ msg, history }) => (msg ? (
  <div className="EditMessage">
    <h4 className="page-header">{`Editing "${msg.message}"`}</h4>
    <MessageEditor existingMessage={msg} history={history} />
  </div>
) : <NotFound />);

EditMessage.propTypes = {
  msg: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};


export default withTracker(({ match }) => {
  const messageId = match.params._id;
  const subscription = Meteor.subscribe('messages.view', messageId);

  return {
    loading: !subscription.ready(),
    msg: Messages.findOne(messageId),
  };
})(EditMessage);

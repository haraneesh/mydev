import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Bert } from 'meteor/themeteorchef:bert';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Messages from '../../../../api/Messages/Messages';
import MessageComments from '../../../components/Messages/MessageComments';
import MessageEditor from '../../../components/Messages/MessageEditor';
import MessageView from '../../../components/Messages/MessageView';

import NotFound from '../../Miscellaneous/NotFound/NotFound';

const EditMessage = ({ msg, history, roles, loggedInUserId }) => {
  const [loadingComments, setLoadingComments] = useState(true);
  const [messageComments, setMessageComments] = useState([]);
  const isAdmin = (roles.indexOf('admin') !== -1);

  useEffect(() => {
    setLoadingComments(true);
    Meteor.call('messageComments.list', (error, messageCommentss) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        setMessageComments(messageCommentss);
      }
      setLoadingComments(false);
    });
  }, []);


  if (msg) {
    const canEditMsg = (isAdmin || loggedInUserId === msg.owner);
    return (
      <div className="EditMessage">
        <h3 className="page-header">
          <button className="btn btn-link" style={{ fontSize: '1.5em' }} onClick={() => { history.goBack(); }}><i className="far fa-arrow-alt-circle-left" /></button>
          {'Message Details'}
        </h3>
        {(canEditMsg) && (<MessageEditor existingMessage={msg} history={history} editMessagePage />)}
        {(!canEditMsg) && (<MessageView existingMessage={msg} editMessagePage />)}
        {(!loadingComments) && (<MessageComments isAdmin={isAdmin} loggedInUserId={loggedInUserId} messageComments={messageComments} history={history} />)}
      </div>);
  }

  return (<NotFound />);
};

EditMessage.propTypes = {
  msg: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  loggedInUserId: PropTypes.bool.isRequired,
  roles: PropTypes.array.isRequired,
};


export default withTracker((args) => {
  const { match, roles, loggedInUserId } = args;
  const messageId = match.params._id;
  const subscription = Meteor.subscribe('messages.view', messageId);

  return {
    loading: !subscription.ready(),
    msg: Messages.findOne(messageId),
    roles,
    loggedInUserId,
  };
})(EditMessage);

import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
import MessagesCollection from '../../../../api/Messages/Messages';
import Loading from '../../../components/Loading/Loading';
import MessageEditor from '../../../components/Messages/MessageEditor';
import MessageView from '../../../components/Messages/MessageView';

import constants from '../../../../modules/constants';

const MessagesAdmin = ({ loading, messages, history }) => {
  const [editMessage, setEditMessage] = useState('');

  const handleEditMessage = (id) => {
    setEditMessage(id);
  };

  const handleMessageUpdate = () => {
    setEditMessage('');
  };

  return !loading ? (
    <div className="Messages">
      <div className="page-header clearfix">
        <h3>Admin Messages</h3>
        {/* <Link className="btn btn-success pull-right" to={`${match.url}/new`}>Add Message</Link> */}
      </div>

      <MessageEditor history={history} />
      {messages.length ?
        messages.map(msg => (<p key={msg._id}>
          {
            (editMessage === msg._id) ?
              (<MessageEditor
                history={history}
                existingMessage={msg}
                showOpen
                onsuccessFullUpdate={handleMessageUpdate}
              />
              ) :
              (<MessageView existingMessage={msg} history={history} handleEditMessage={handleEditMessage} />)
          }
        </p>
        )) : <Alert bsStyle="warning">No messages yet!</Alert>}
    </div>)
    : (<Loading />);
};

MessagesAdmin.propTypes = {
  loading: PropTypes.bool.isRequired,
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker((args) => {
  const subscription = Meteor.subscribe('messages.all');
  return {
    history: args.history,
    loading: !subscription.ready(),
    messages: MessagesCollection.find({}, { sort: { updatedAt: constants.Sort.DESCENDING } }).fetch(),
  };
})(MessagesAdmin);

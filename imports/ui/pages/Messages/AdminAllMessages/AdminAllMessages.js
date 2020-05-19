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

const comboStyle = {
  backgroundImage: 'url(data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E), linear-gradient(to bottom, #ffffff 0%,#e5e5e5 100%)',
  backgroundRepeat: 'no-repeat, repeat',
  backgroundPosition: 'right .7em top 50%, 0 0',
  backgroundSize: '.65em auto, 100%',
  padding: '0.75rem 0.5rem',
  width: '100%',
  marginBottom: '0.75rem',
};

const MessagesAdmin = ({ loading, messages, history }) => {
  const [editMessage, setEditMessage] = useState('');
  const [filterSelected, setFilterSelected] = useState('all');

  const handleEditMessage = (id) => {
    setEditMessage(id);
  };

  const handleMessageUpdate = () => {
    setEditMessage('');
  };

  const onFilterSelect = (e) => {
    setFilterSelected(e.target.value);
  };

  return !loading ? (
    <div className="Messages">
      <div className="page-header clearfix">
        <h3>Admin Messages</h3>
        {/* <Link className="btn btn-success pull-right" to={`${match.url}/new`}>Add Message</Link> */}
      </div>

      <MessageEditor history={history} />

      <div className="panel-heading" style={{ padding: '0.5rem 0.5rem' }}>
        <select name="filter" id="idFilter" onChange={onFilterSelect} style={comboStyle}>
          <option value="all">All</option>
          <option value={constants.MessageTypes.Issue.name}>{constants.MessageTypes.Issue.display_value}</option>
          <option value={constants.MessageTypes.Appreciation.name}>{constants.MessageTypes.Appreciation.display_value}</option>
          <option value={constants.MessageTypes.Message.name}>{constants.MessageTypes.Message.display_value}</option>
          <option value={constants.MessageTypes.Suggestion.name}>{constants.MessageTypes.Suggestion.display_value}</option>
        </select>
      </div>


      {messages.length ?
        messages.map((msg) => {
          if (msg.messageType === filterSelected || filterSelected === 'all') {
            return (
              <div style={{ marginBottom: '1rem' }} key={msg._id}>
                {
                  (editMessage === msg._id) ?
                    (<MessageEditor
                      history={history}
                      existingMessage={msg}
                      showOpen
                      onsuccessFullUpdate={handleMessageUpdate}
                      isAdmin
                    />
                    ) :
                    (<MessageView existingMessage={msg} history={history} handleEditMessage={handleEditMessage} />)
                }
              </div>
            );
          }
        },
        ) : <Alert bsStyle="warning">No messages yet!</Alert>}
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

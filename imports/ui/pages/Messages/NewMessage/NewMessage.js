import React from 'react';
import PropTypes from 'prop-types';
import MessageEditor from '../../../components/Messages/MessageEditor';

const NewMessage = ({ history }) => (
  <div className="NewMessage">
    <h4 className="page-header">New Message</h4>
    <MessageEditor history={history} />
  </div>
);

NewMessage.propTypes = {
  history: PropTypes.object.isRequired,
};

export default NewMessage;

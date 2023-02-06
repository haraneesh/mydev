import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import * as timeago from 'timeago.js';
import { dateSettings } from '../../../modules/settings';

import './Message.scss';

const MessageCommentView = ({
  comment, handleEditComment, isAdmin, loggedInUserId,
}) => {
  const {
    updatedAt, description, _id, ownerName, owner,
  } = comment;
  const isLoggedInUserCommentOwner = (owner === loggedInUserId);
  return (
    <div key={_id}>
      <div className="list-group-item bg-light p-4">
        <Row>
          <Col xs={7} style={{ paddingBottom: '10px' }}>
            <div className="text-info" style={{ padding: '0px', marginBottom: '7px' }}>
              {ownerName}
            </div>
          </Col>
          <Col xs={5} style={{ textAlign: 'right' }}>
            <small className="text-muted">{timeago.format(updatedAt, dateSettings.timeZone)}</small>
            {' '}
&nbsp;
            {(isLoggedInUserCommentOwner || isAdmin) && (<button className="btn btn-info btn-xs btn-block" id={`id-${_id}`} onClick={() => { handleEditComment(_id); }}>edit</button>)}
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            {description}
          </Col>
        </Row>
        <Row>
          <Col xs={12} className="text-right" style={{ paddingBottom: '1.5em' }} />
        </Row>
      </div>
    </div>
  );
};

MessageCommentView.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  comment: PropTypes.object.isRequired,
  loggedInUserId: PropTypes.string.isRequired,
  handleEditComment: PropTypes.func.isRequired,
};

export default MessageCommentView;

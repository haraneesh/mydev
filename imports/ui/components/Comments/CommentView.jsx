import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import CommentWrite from './CommentWrite';
import constants from '../../../modules/constants';
import { removeComment } from '../../../api/Comments/methods';

export default class CommentView extends React.Component {
  constructor(props, context) {
    super(props, context);

    this._stateValue = {
      edit: 'EDIT',
      view: 'VIEW',
    };

    this.state = {
      mode: constants.ControlStates.view,
    };

    this.handleEditComment = this.handleEditComment.bind(this);
    this.handleEditSaveOrCancel = this.handleEditSaveOrCancel.bind(this);
    this.handleDeleteComment = this.handleDeleteComment.bind(this);
  }

  handleEditComment() {
    this.setState({
      mode: constants.ControlStates.edit,
    });
  }

  handleEditSaveOrCancel(action) {
    this.setState({
      mode: constants.ControlStates.view,
    });
  }

  handleDeleteComment() {
    const { expandedComment } = this.props;
    if (confirm('Are you sure you want to delete the comment? This is permanent.')) {
      removeComment.call({
        _id: expandedComment._id,
      }, (error) => {
        if (error) {
          toast.error(error.reason);
        } else {
          toast.success('Removed comment');
        }
      });
    }
  }

  render() {
    const { expandedComment, loggedUserId } = this.props;
    const creatorOfComment = loggedUserId == expandedComment.owner;
    const addDeleteOptions = (

      <Dropdown>
        <Dropdown.Toggle id="dropdown-basic" size="sm">
          Action
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item href="#" onClick={this.handleEditComment}>Edit Comment</Dropdown.Item>
          <Dropdown.Item href="#" onClick={this.handleDeleteComment}>Delete Comment</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

    );

    if (this.state.mode === constants.ControlStates.view) {
      return (
        <Row controlId="commentsView">
          <Row>
            <Col xs={9}>
              <small className="text-muted">{ expandedComment.displayName }</small>
            </Col>
            <Col xs={3} className="text-right">
              { creatorOfComment && addDeleteOptions }
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <p className="text-left">
                {' '}
                { expandedComment.description }
                {' '}
              </p>
            </Col>
          </Row>
        </Row>
      );
    }

    return (
      <CommentWrite
        loggedUserId={expandedComment.loggedUserId}
        postId={expandedComment.postId}
        postType={expandedComment.postType}
        expandedComment={expandedComment}
        onSave={this.handleEditSaveOrCancel}
      />
    );
  }
}

CommentView.propTypes = {
  expandedComment: PropTypes.object.isRequired,
  loggedUserId: PropTypes.string.isRequired,
  // onEditChange: PropTypes.func.isRequired,
};

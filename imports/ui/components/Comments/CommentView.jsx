import React from 'react';
import { Form, Row, Col, FormGroup, ControlLabel, FormControl, Button, Glyphicon, Dropdown, MenuItem } from 'react-bootstrap';
import CommentWrite from './CommentWrite';
import constants from '../../../modules/constants';
import { removeComment } from '../../../api/Comments/methods';
import PropTypes from 'prop-types';

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
    event.preventDefault();
    if (confirm('Are you sure you want to delete the comment? This is permanent.')) {
        removeComment.call({
          _id: expandedComment._id,
        }, (error) => {
          if (error) {
            Bert.alert(error.reason, 'danger');
          } else {
            Bert.alert('Removed comment', 'success');
          }
        });
      }
  }

  render(){
      const { expandedComment, currentUser } = this.props
      const creatorOfComment = currentUser == expandedComment.owner
      const addDeleteOptions = (
         <Dropdown id="comment-edit" pullRight>
            <Dropdown.Toggle noCaret bsStyle="link no-margin-no-padding">
              <small> <Glyphicon glyph="option-vertical" className="text-muted"/> </small>
            </Dropdown.Toggle>
            <Dropdown.Menu className="comment-dropdown">
              <MenuItem eventKey="1" onClick= { this.handleEditComment } >Edit Comment</MenuItem>
              <MenuItem eventKey="2" onClick= { this.handleDeleteComment } >Delete Comment</MenuItem>
            </Dropdown.Menu>
          </Dropdown>
      )

      if (this.state.mode === constants.ControlStates.view){
        return (
            <FormGroup controlId="commentsView">
              <Row> 
                <Col xs={ 6 }> 
                  <small className="text-muted">{ expandedComment.displayName }</small> 
                </Col> 
                <Col xs={ 6 } className="text-right">
                 { creatorOfComment && addDeleteOptions }
                </Col> 
              </Row>
              <Row>
                 <Col xs={ 12 }>
                    <p className="text-left" > { expandedComment.description } </p>
                 </Col>
              </Row>
            </FormGroup> 
        )
      } 
      
        return (
         <CommentWrite 
              postId = {expandedComment.postId } 
              expandedComment = { expandedComment } 
              onSave = { this.handleEditSaveOrCancel } 
              />
        )
      
  }
}

CommentView.propTypes = {
  expandedComment: PropTypes.object.isRequired,
  currentUser: PropTypes.string,
  // onEditChange: PropTypes.func.isRequired,
};

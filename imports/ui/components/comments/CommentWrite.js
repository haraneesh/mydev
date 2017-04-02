import React from 'react';
import { FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
import { upsertComment } from '../../../api/comments/methods'
import { Bert } from 'meteor/themeteorchef:bert'
import constants from '../../../modules/constants'

const saveComment = (postId, commentId,commentAddBoxName, onSave) => {
  const user = Meteor.user()
  inputName = '[name="' + commentAddBoxName + '"]'
  let comment = {
      postType: "comment",
      description: document.querySelector(inputName).value,
      postId:postId,
      owner:user._id,
    }

  comment._id = commentId? commentId:""

   upsertComment.call(comment, (error, { insertedId }) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          const message = insertedId? "Added Comment" : "Updated Comment"
          Bert.alert(message, 'success')
          if (onSave){
            onSave('Update')
          }
        }
    });
}

const CommentWrite = ({ postId, expandedComment, onSave }) => {
  const value = expandedComment? expandedComment.description:""
  const cancelButton = onSave? (<Button bsSize='small' onClick = {()=>onSave('cancel')} > Cancel </Button>) : ""
  const saveButtonText = onSave? "Update" : "Post"
  const commentId = expandedComment?  expandedComment._id : ""
  const commentAddBoxName = "commentAddBox_" + commentId

  return(
    <FormGroup controlId="commentWrite">
      <FormControl name = { commentAddBoxName } componentClass="textarea" rows="2" placeholder="Write a response ..." 
         defaultValue = { value }
      />
      <Button bsSize="small" className="btn-primary" onClick = {()=>saveComment(postId, commentId , commentAddBoxName , onSave)} > { saveButtonText } </Button>
      { cancelButton }
    </FormGroup> 
  )
}

CommentWrite.propTypes={
  postId: React.PropTypes.string.isRequired,
  expandedComment:React.PropTypes.string,
  onSave:React.PropTypes.func
}

export default CommentWrite


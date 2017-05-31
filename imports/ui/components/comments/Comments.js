/* eslint-disable max-len, no-return-assign */

import React from 'react';
import { Row, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
//import recipeEditor from '../../../modules/recipe-editor';
import { upsertComment } from '../../../api/comments/methods'
import CommentView from './CommentView'
import CommentWrite from './CommentWrite'
import { Bert } from 'meteor/themeteorchef:bert'
import PropTypes from 'prop-types'

export default class Comments extends React.Component {
  constructor (props, context){
      super(props, context)
  }

  componentDidMount() {
   // recipeEditor({ component: this });
   // setTimeout(() => { document.querySelector('[name="title"]').focus(); }, 0);
  }

  addOrUpdateComment(){
      this._currentUser = Meteor.user()
      const recipe = {
         title: document.querySelector('[name="title"]').value.trim(),
         description: document.querySelector('[name="body"]').value.trim(),
         ingredients: this.objectToValueArray(this._ingredientList),
         owner: this._currentUser._id,
         _id: this.props.recipe ? this.props.recipe._id: ""
      }

      upsertComment.call(recipe, (error, { insertedId }) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          const message = insertedId? "Created New Recipe!" : "'Updated Recipe!'"
        }
      });
  }

  objectToValueArray(ingredientList){
    let ingredients = []
    _.each(ingredientList, function(value, key){
       ingredients.push(value)
    })
    return ingredients
  }

  getUserHashObject(users){
    const userHash = {}
    users.forEach(function(user, index){
      userHash[user._id] = user
    })
    return userHash
  }

  render() {
    const currentUser = Meteor.userId()
    const { postId, comments, commentUsers } = this.props
    this.commentUserHash = this.getUserHashObject(commentUsers)
    let commentViews = comments.map(function(comment, index) {
                          const commentOwner = this.commentUserHash[comment.owner]
                          let expandedComment = comment
                          expandedComment.displayName = commentOwner.profile.name.first + " " + commentOwner.profile.name.last
                          return <CommentView expandedComment = { expandedComment } currentUser = { currentUser } /> 
                        }, this)
    return(
      <div>
        <CommentWrite postId = { postId } />
        { commentViews }
      </div>
    )
  }
}

Comments.propTypes = {
  postId: PropTypes.string,
  comments: PropTypes.array,
  commentUsers: PropTypes.array
};

/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
// import recipeEditor from '../../../modules/recipe-editor';
import CommentView from './CommentView';
import CommentWrite from './CommentWrite';


export default class Comments extends React.Component {

  getUserHashObject(users) {
    const userHash = {};
    users.forEach((user, index) => {
      userHash[user._id] = user;
    });
    return userHash;
  }

  objectToValueArray(ingredientList) {
    const ingredients = [];
    _.each(ingredientList, (value, key) => {
      ingredients.push(value);
    });
    return ingredients;
  }

  render() {
    const { postId, postType, loggedUserId, comments, commentUsers } = this.props;
    this.commentUserHash = this.getUserHashObject(commentUsers);
    const commentViews = comments.map(function (comment, index) {
      const commentOwner = this.commentUserHash[comment.owner];
      const expandedComment = comment;
      expandedComment.displayName = `${commentOwner.profile.name.first} ${commentOwner.profile.name.last}`;
      return <CommentView expandedComment={expandedComment} loggedUserId={loggedUserId} key={`comment-${index}`} />;
    }, this);
    return (
      <div>
        <CommentWrite postId={postId} postType={postType} loggedUserId={loggedUserId} />
        { commentViews }
      </div>
    );
  }
}

Comments.defaultProps = {
  loggedUserId: Meteor.userId(),
  comments: [],
  commentUSers: [],
};

Comments.propTypes = {
  postId: PropTypes.string.isRequired,
  postType: PropTypes.string.isRequired,
  loggedUserId: PropTypes.string.isRequired,
  comments: PropTypes.array,
  commentUsers: PropTypes.array,
};

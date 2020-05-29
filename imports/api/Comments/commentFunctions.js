import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import Comments from './Comments';
import handleMethodException from '../../modules/handle-method-exception';


function getUser(userId) {
  const usr = Meteor.users.find(userId, {
    fields: {
      profile: 1,
      roles: 1,
    },
  }).fetch()[0];

  const ownerName = `${usr.profile.salutation ? usr.profile.salutation : 'Mrs'} ${[usr.profile.name.last, usr.profile.name.first].filter(Boolean).join(', ')}`;

  return {
    owner: userId,
    ownerName,
    ownerRole: usr.roles[0],
  };
}

function commentInsert(comment) {
  check(comment, {
    postId: String,
    postType: String,
    commentStatus: Match.Maybe(String),
    commentText: String,
    owner: String,
  });

  try {
    const cmt = {
      postType: comment.postType,
      postId: comment.postId,
      description: comment.commentText,
      owner: comment.owner,
      ownerName: getUser(comment.owner).ownerName,
      status: comment.commentStatus,
    };

    return Comments.insert(cmt);
  } catch (exception) {
    handleMethodException(exception);
  }
}

function commentUpdate(comment) {
  check(comment, {
    commentId: String,
    postId: String,
    postType: String,
    commentStatus: Match.Maybe(String),
    commentText: String,
    owner: String,
  });

  try {
    const cmt = {
      postType: comment.postType,
      postId: comment.postId,
      description: comment.commentText,
      owner: comment.owner,
      ownerName: getUser(comment.owner).ownerName,
      status: comment.commentStatus,
    };

    Comments.update({ _id: comment.commentId }, { $set: cmt });
    return comment.commentId;
  } catch (exception) {
    handleMethodException(exception);
  }
}

function getComments(postId) {
  check(postId, String);
  return Comments.find({ postId }).fetch();
}

function commentDelete(commentId) {
  check(commentId, String);
  Comments.remove({ _id: commentId });
}

function allCommentsOfPost(postId) {
  check(postId, String);
  Comments.remove({ postId });
}

export default {
  getUser,
  getComments,
  commentInsert,
  commentUpdate,
  commentDelete,
  allCommentsOfPost,
};


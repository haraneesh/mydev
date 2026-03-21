import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import Comments from './Comments';
import handleMethodException from '../../modules/handle-method-exception';

async function getUser(userId) {
  const usr = await Meteor.users.findOneAsync(userId, {
    fields: {
      profile: 1,
      roles: 1,
    },
  });

  const ownerName = `${usr.profile.salutation ? usr.profile.salutation : 'Mrs'} ${[usr.profile.name.last, usr.profile.name.first].filter(Boolean).join(', ')}`;

  const roles = await Roles.getRolesForUserAsync(userId);
  return {
    owner: userId,
    ownerName,
    ownerRole: roles[0],
  };
}

async function commentInsert(comment) {
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

    return await Comments.insertAsync(cmt);
  } catch (exception) {
    handleMethodException(exception);
  }
}

async function commentUpdate(comment) {
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

    await Comments.updateAsync({ _id: comment.commentId }, { $set: cmt });
    return comment.commentId;
  } catch (exception) {
    handleMethodException(exception);
  }
}

async function getComments(postId) {
  check(postId, String);
  return await Comments.find({ postId }).fetchAsync();
}

async function commentDelete(commentId) {
  check(commentId, String);
  await Comments.removeAsync({ _id: commentId });
}

async function allCommentsOfPost(postId) {
  check(postId, String);
  await Comments.removeAsync({ postId });
}

export default {
  getUser,
  getComments,
  commentInsert,
  commentUpdate,
  commentDelete,
  allCommentsOfPost,
};

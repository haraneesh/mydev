import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/dburles:factory';

const Comments = new Mongo.Collection('Comments');
export default Comments;

if ( Meteor.isServer ) {
  Comments._ensureIndex( { postId:1 } );
}

Comments.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Comments.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Comments.schema = new SimpleSchema({  
  postType:{
    type:String,
    label: 'The type of post to which this comment is attached to.', 
  },
  postId:{ 
    type:String,
    label: 'The ID of the post to which this comment is attached.', 
  },
  description: {
    type: String,
    label: 'The comment goes here.',
  },
  owner: {
    type: String,
    label: 'The person who created the post.'
  },
  createdAt: { type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date()};
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    },
    optional: true
  },
  // Force value to be current date (on server) upon update
  // and don't allow it to be set upon insert.
  updatedAt: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert:true,
    optional: true
  }
});

Comments.attachSchema(Comments.schema);

Factory.define('comment', Comments, {
  title: () => 'Factory Title',
  desription: () => 'Factory Body',
});

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Documents from './Documents';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

Meteor.methods({
  'documents.insert': async function documentsInsert(doc) {
    check(doc, {
      title: String,
      body: String,
    });

    try {
      return await Documents.insertAsync({ owner: this.userId, ...doc });
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'documents.update': async function documentsUpdate(doc) {
    check(doc, {
      _id: String,
      title: String,
      body: String,
    });

    try {
      const documentId = doc._id;
      await Documents.updateAsync(documentId, { $set: doc });
      return documentId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'documents.remove': async function documentsRemove(documentId) {
    check(documentId, String);

    try {
      return await Documents.removeAsync(documentId);
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

rateLimit({
  methods: [
    'documents.insert',
    'documents.update',
    'documents.remove',
  ],
  limit: 5,
  timeRange: 1000,
});

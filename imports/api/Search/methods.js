import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import rateLimit from '../../modules/rate-limit';
import Search from './Search';

Meteor.methods({
  'search.captureSearchString': async function captureSearchString(searchString) {
    check(searchString, String);

    const searchRecord = {
      searchString,
      userId: (this.userId) ? this.userId : '',
    };

    const ifExistsSrch = await Search.findOneAsync(searchRecord);

    if (!ifExistsSrch) {
      return await Search.insertAsync({ ...searchRecord, count: 0 });
    }
    return await Search.updateAsync({ _id: ifExistsSrch._id }, { $inc: { count: 1 } });
  },
});

rateLimit({
  methods: [
    'search.captureSearchString',
  ],
  limit: 5,
  timeRange: 1000,
});

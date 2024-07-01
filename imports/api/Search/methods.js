import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import rateLimit from '../../modules/rate-limit';
import Search from './Search';

Meteor.methods({
  'search.captureSearchString': function captureSearchString(searchString) {
    check(searchString, String);

    const searchRecord = {
      searchString,
      userId: (this.userId) ? this.userId : '',
    };

    const ifExistsSrch = Search.findOne(searchRecord);

    if (!ifExistsSrch) {
      return Search.insert({ ...searchRecord, count: 0 });
    }
    return Search.update({ _id: ifExistsSrch._id }, { $inc: { count: 1 } });
  },
});

rateLimit({
  methods: [
    'search.captureSearchString',
  ],
  limit: 5,
  timeRange: 1000,
});

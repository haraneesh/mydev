import { Meteor } from 'meteor/meteor';
import zohoCreditNotes from '../ZohoSyncUps/zohoCreditNotes';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

Meteor.methods({
  'creditNotes.getCreditNotes': function getCreditNotes(){
    try {
      if (Meteor.isServer){
        const query = { _id: this.userId };
        const user = Meteor.users.find(query).fetch();
        const r = zohoCreditNotes.getCustomerCreditNotes( user[0].zh_contact_id);

        if (r.code !== 0) {
          handleMethodException(r, r.code);
        }
        return r.creditnotes;
      }
    }
    catch (exception){
      handleMethodException(exception);
    }
  },
});

rateLimit({
  methods: ['creditNotes.getCreditNotes'],
  limit: 5,
  timeRange: 1000,
});

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import zohoCreditNotes from '../ZohoSyncUps/zohoCreditNotes';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

Meteor.methods({
  'creditNotes.getCreditNotes': async function getCreditNotes(){
    try {
      if (Meteor.isServer){
        const query = { _id: this.userId };
        const users = await Meteor.users.find(query).fetchAsync();
        if (users[0].zh_contact_id){
        const r = await zohoCreditNotes.getCustomerCreditNotes( users[0].zh_contact_id);

        if (r.code !== 0) {
          handleMethodException(r, r.code);
        }
        return r.creditnotes;
      }
      else {
        return [];
      }
      }
    }
    catch (exception){
      handleMethodException(exception);
    }
  },
  'creditNotes.getCreditNote': async function getCreditNote(creditNoteId){
    check(creditNoteId, String);
    try{
      if (Meteor.isServer){
        const query = { _id: this.userId };
        const users = await Meteor.users.find(query).fetchAsync();

        if (users[0].zh_contact_id){
        const r = await zohoCreditNotes.getCreditNote(creditNoteId);

        if (r.code !== 0) {
          handleMethodException(r, r.code);
        }

        if(users[0].zh_contact_id === r.creditnote.customer_id){
          return r.creditnote;
        }
        
        return {};
       
      }
    }

    }
    catch (exception){
      handleMethodException(exception);
    }
  }
});

rateLimit({
  methods: ['creditNotes.getCreditNotes', 'creditNotes.getCreditNote'],
  limit: 5,
  timeRange: 1000,
});

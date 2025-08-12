import { Meteor } from 'meteor/meteor';

declare module 'meteor/meteor' {
  namespace Meteor {
    interface User {
      _id: string;
      emails?: Array<{ address: string; verified: boolean }>;
      profile?: {
        name?: string;
        firstName?: string;
        lastName?: string;
        zohoCustomerId?: string;
        customer_id?: string;
        [key: string]: any;
      };
      roles?: string[];
      services?: any;
      [key: string]: any;
    }
  }
}

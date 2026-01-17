import { Mongo } from 'meteor/mongo';

const Notifications = new Mongo.Collection('notifications');

Meteor.startup(() => {
  if (Meteor.isServer) {
    const allRecords = Notifications.find({}).fetch();
    console.log('=== NOTIFICATION SUBSCRIBERS ===');
    console.log(`Total records: ${allRecords.length}`);
    allRecords.forEach((record, index) => {
      console.log(`\n${index + 1}. User: ${record.userId}`);
      console.log(`   Player ID: ${record.playerId}`);
      console.log(`   Device Type: ${record.deviceType}`);
      console.log(`   Device UUID: ${record.deviceUuid || 'N/A'}`);
      console.log(`   Created: ${record.createdAt}`);
      console.log(`   Updated: ${record.updatedAt}`);
    });
  }
});

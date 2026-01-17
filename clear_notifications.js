// Run this in MongoDB to clear all invalid player IDs
// mongo suvaidb
// db.notifications.deleteMany({})

// Or via Meteor shell:
Meteor.call('clearInvalidNotifications', {}, (err, result) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Cleared notifications:', result);
  }
});

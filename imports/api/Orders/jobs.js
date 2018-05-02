import Agenda from 'Agenda';
import Orders from './Orders';

const agenda = new Agenda({ db: { address: process.env.MONGO_URL } });

agenda.define('Combine Last 3 Orders', async (job, done) => {
  try {
  // prepareRecentOrderList(job);

  // do whatever with jobs
 // console.log(new Date());
 // For all orders placed yesterday
    const oneDayInMilliSeconds = 24 * 60 * 60 * 1000 * 5;
    const yesterdaysOrders = Orders.find({ createdAt: { $gt: new Date(Date.now() - oneDayInMilliSeconds) } }).fetch();
    console.log('Here 1');
    yesterdaysOrders.forEach((order) => {
    // const last3Orders = Orders.find({ _id: order._id }).sort({ createdAt: 'desc' }).limit(3).fetch();
      const last3Orders = Orders.find({ _id: order._id }, { sort: { createdAt: -1 }, limit: 3 }).fetch();
      console.log(last3Orders[0]._id);
      last3Orders.forEach((order) => {
        // const order =
      });
    });
 // find out the member and last 3 orders
 // merge their orders
 // insert as new recommendation
    console.log('here');

    done();
  } catch (error) {
   // Phusion passenger error logs will contain this error in production
    console.error(error);
  }
});

agenda.on('ready', () => {
    // 0 8 * * * - runs at 8am
    // 30 2 * * * - 2.30 am everyday
    // 0 18 * * * - 6 PM everyday
    // */3 * * * * - every 3 minutes
  agenda.every('*/3 * * * *', 'Combine Last 3 Orders');
  // agenda.every('0 8 * * *');
  agenda.start();
});

function ruthere(source, target) {
  const retTarget = target;

  const srcCounter = 0;
  while (!tarObj && source.length >= srcCounter) {

  }

  source.forEach((product) => {
    const srcObj = product;
    let tarObj;

    target.forEach((product) => {
      const obj = product;
      if (srcObj._id === tarObj._id) {
        tarObj = product;
      }
    });

    if (!tarObj) {
      retTarget.push(srcObj);
    }
  });

  return retTarget;
}

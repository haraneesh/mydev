import Agenda from 'Agenda';
import Orders from './Orders';
import Recommendations from '../Recommendations/Recommendations';
import constants from '../../modules/constants';

const agenda = new Agenda({ db: { address: process.env.MONGO_URL } });

function combineOrders(productListToMerge, combinedProductList = {}) {
  const newCombinedProductList = combinedProductList;

  productListToMerge.forEach((product) => {
    if (newCombinedProductList[product._id]) {
      newCombinedProductList[product._id].orderedTimes += 1;
    } else {
      newCombinedProductList[product._id] = {
        productId: product._id,
        name: product.name,
        orderedTimes: 1,
      };
    }
  });
  return newCombinedProductList;
}

agenda.define('Create Recommendation From Previous Orders', async (job, done) => {
  try {
    const jobLastRunAt = job.attrs.lastRunAt;
   // const oneDayInMilliSeconds = 24 * 60 * 60 * 1000 * 5;
    const newUpdatedOrders = Orders.find({ $and: [
      { updatedAt: { $gt: new Date(jobLastRunAt) } },
      { order_status: constants.OrderStatus.Completed.name }],
    }).fetch();

   // console.log('-');
   // console.log(job.attrs.lastRunAt);
   // console.log(job.attrs.nextRunAt);

    newUpdatedOrders.forEach((order) => {
      const last10Orders = Orders.find({ $and: [
      { order_status: constants.OrderStatus.Completed.name },
      { 'customer_details._id': order.customer_details._id },
      ] },
      { sort: { createdAt: -1 }, limit: 10 }).fetch();

      let combinedProductList = {};
      const prevOrdersConsidered = [];
      last10Orders.forEach((ord) => {
        combinedProductList = combineOrders(ord.products, combinedProductList);
        prevOrdersConsidered.push(ord._id);
      });

      const recommendation = {
        customerId: order.customer_details._id,
        recPrevOrderedProducts: {
          prevOrdersConsidered,
          prevOrderedProducts: combinedProductList,
        },
      };
      // console.log(recommendation);
      Recommendations.upsert({ customerId: order.customer_details._id }, { $set: recommendation });
    });

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
  // agenda.every('*/3 * * * *', 'Create Recommendation From Previous Orders');
  agenda.every('0 8 * * *');
  agenda.start();
});

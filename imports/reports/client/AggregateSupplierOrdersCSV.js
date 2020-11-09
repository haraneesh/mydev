// import moment from 'moment';
// import 'moment-timezone';
import constants from '../../modules/constants';
import { getDisplayDate, getDayWithoutTime, displayUnitOfSale } from '../../modules/helpers';
import { dateSettings } from '../../modules/settings';

class AggregateSupplierOrderCSV {
    static createDisplayRows = (orders) => {
      const sparseProductOrderList = {};
      const productRows = {};
      const orderRows = {};

      orders.forEach((order) => {
        if (!orderRows[order._id]) {
          orderRows[order._id] = {
            _id: order._id,
            customerDetails: order.customer_details,
            orderStatus: order.order_status,
            createdAt: order.createdAt,
          };
        }

        order.products.forEach((product) => {
          if (!sparseProductOrderList[product._id]) {
            sparseProductOrderList[product._id] = [];
          }
          if (!sparseProductOrderList[product._id][order._id]) {
            sparseProductOrderList[product._id][order._id] = {
              quantity: product.quantity,
              unitOfSale: product.unitOfSale,
            };
          }
          if (!productRows[product._id]) {
            productRows[product._id] = {
              name: product.name,
            };
          }
        });
      });

      return {
        orderRows,
        sparseProductOrderList,
        productRows,
      };
    }

  static exportSOsAsCSV = ({ suppOrders }) => {
    const csv = [];
    const today = new Date();
    const SOdate = getDisplayDate(today, dateSettings.timeZone);

    const {
      orderRows,
      sparseProductOrderList,
      productRows,
    } = this.createDisplayRows(suppOrders);

    const orderRowIds = Object.keys(orderRows);

    let row1 = 'Product Name';
    orderRowIds.forEach((orderId) => {
      const { customerDetails } = orderRows[orderId];
      row1 = `${row1},${customerDetails.name}`;
    }, 'Product Name');

    csv.push(row1);

    Object.keys(productRows).forEach((productId) => {
      // const productRow = sparseProductOrderList[productId];
      // let row = `${order.customer_details.name},${constants.OrderStatus[order.order_status].display_value},${getDayWithoutTime(order.createdAt, dateSettings.timeZone)}`;
      let row = `${productRows[productId].name}`;
      orderRowIds.forEach((orderId) => {
        row += ',';
        if (sparseProductOrderList[productId][orderId]) {
          const product = sparseProductOrderList[productId][orderId];
          row += displayUnitOfSale(product.quantity, product.unitOfSale);
        }
      });
      csv.push(row);
    });

    this.downloadFile(csv, SOdate);
  }

    static downloadFile = (csv, SOdate) => {
      const element = document.createElement('a');

      element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv.join('\r\n'))}`);
      element.setAttribute('download', `Orders_${SOdate}.csv`);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }
}

export default AggregateSupplierOrderCSV.exportSOsAsCSV;

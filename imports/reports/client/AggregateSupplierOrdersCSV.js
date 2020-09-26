// import moment from 'moment';
// import 'moment-timezone';
import constants from '../../modules/constants';
import { getDisplayDate, getDayWithoutTime, displayUnitOfSale } from '../../modules/helpers';
import { dateSettings } from '../../modules/settings';

class AggregateSupplierOrderCSV {
    static createDisplayRows = (orders) => {
      const sparseList = {};
      const productRows = {};
      orders.forEach((order) => {
        if (!sparseList[order._id]) {
          sparseList[order._id] = {
            _id: order._id,
            customer_details: order.customer_details,
            order_status: order.order_status,
            createdAt: order.createdAt,
          };
        }

        order.products.forEach((product) => {
          if (!sparseList[order._id][product._id]) {
            sparseList[order._id][product._id] = {
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
        sparseList,
        productRows,
      };
    }

  static exportSOsAsCSV = ({ suppOrders }) => {
    const csv = [];
    const today = new Date();
    const SOdate = getDisplayDate(today, dateSettings.timeZone);

    const { sparseList, productRows } = this.createDisplayRows(suppOrders);

    const rowNames = Object.keys(productRows).reduce((agg, productId) => {
      const productRow = productRows[productId];
      return `${agg},${productRow.name}`;
    }, 'Shop Name, Order Status, Order Date');

    csv.push(rowNames);

    Object.keys(sparseList).forEach((orderId) => {
      const order = sparseList[orderId];
      let row = `${order.customer_details.name},${constants.OrderStatus[order.order_status].display_value},${getDayWithoutTime(order.createdAt, dateSettings.timeZone)}`;

      Object.keys(productRows).forEach((productId) => {
        row += ',';
        if (sparseList[order._id][productId]) {
          const product = sparseList[order._id][productId];
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

import React from 'react';
import { formatMoney } from 'accounting-js';
import { accountSettings, dateSettings } from '../../modules/settings';
import ReactDOMServer from 'react-dom/server';
import moment from 'moment';
import 'moment-timezone';

const _getHeader = () => '<!DOCTYPE html> <html><title>Invoices | Suvai</title> <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"> <head></head><body>';
const _getFooter = () => '</body></html>';

const _readyOrderToPrint = order => ReactDOMServer.renderToStaticMarkup(
  <div className="container">
    <div className="row">
      <div className="invoice-title">
        <div className="col-xs-4">
          <h2>Suvai</h2>
        </div>
        <div className="col-xs-8">
          <h3 className="pull-right">
            {moment(order.createdAt).tz(dateSettings.timeZone).format(dateSettings.format)}
          </h3>
        </div>
      </div>
    </div>
    <div className="row">
      <div className="col-xs-12">
        <address>
          <strong>Billed To:</strong><br />
          {order.customer_details.name}<br />
          {order.customer_details.deliveryAddress}
        </address>
      </div>
    </div>
    <div className="row">
      <div className="col-md-12">
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title"><strong>Order summary</strong></h3>
          </div>
          <div className="panel-body">
            <div className="table-responsive">
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <td><strong>Item</strong></td>
                    <td className="text-center"><strong>Qty / Price</strong></td>
                    <td className="text-right"><strong>Total</strong></td>
                  </tr>
                </thead>
                <tbody>
                  {
                      order.products.map((product, index) => {
                        if (product.quantity > 0) {
                          return (
                            <tr key={`gob-${index}`}>
                              <td>{`${product.name} ${product.unitOfSale}`}</td>
                              <td className="text-center">{`${product.quantity} x ${product.unitprice}`}</td>
                              <td className="text-right">{formatMoney(product.unitprice * product.quantity, accountSettings)}</td>
                            </tr>
                          );
                        }
                      })
                    }
                  <tr>
                    <td className="no-line" />
                    <td className="no-line text-center"><strong>Total</strong></td>
                    <td className="no-line text-right" colSpan="2">{formatMoney(order.total_bill_amount, accountSettings)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="row">
              <div className="col-xs-12">
                {order.comments}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    );

const generateOrderBills = (ordersToPrint /* selected list of orders */) => {
  let htmlReport = _getHeader();
  _.each(ordersToPrint, (order, key) => {
    htmlReport += _readyOrderToPrint(ordersToPrint[key]);
  }, this, htmlReport);
  htmlReport += _getFooter();
    // this.suvaiA4Report.printHTMLReport(htmlReport);
  const reportWindow = window.open('', 'ReportWindow');
  reportWindow.document.write(htmlReport);
};

export default generateOrderBills;

import React from 'react';
import { formatMoney } from 'accounting-js';
import ReactDOMServer from 'react-dom/server';
import moment from 'moment';
import 'moment-timezone';

import { accountSettings, dateSettings } from '../../modules/settings';
import { displayUnitOfSale } from '../../modules/helpers';

const getHeader = () => '<!DOCTYPE html> <html> <head>'
  + '<title>Invoices | Suvai</title>'
  + '<link rel="stylesheet" '
  + 'type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" /> '
  + '<style type="text/css" media="print">'
  + 'div.page {'
  + 'page-break-after: always;'
  + 'page-break-inside: avoid;'
  + '}</style>'
  + '</head><body>';
const getFooter = () => '</body></html>';

const readyOrderToPrint = (order) => ReactDOMServer.renderToStaticMarkup(
  <div className="page">
    <div className="container">
      <div className="row">
        <div className="invoice-title">
          <div className="col-4">
            <h2>Suvai</h2>
          </div>
          <div className="col-8">
            <h3 className="pull-right">
              {moment(order.createdAt).tz(dateSettings.timeZone).format(dateSettings.format)}
            </h3>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <address>
            <strong>Billed To:</strong>
            <br />
            {order.customer_details.name}
            <br />
            {order.customer_details.deliveryAddress}
          </address>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title"><strong>Order summary</strong></h3>

              <div className="card-text">
                <div className="table-responsive">
                  <table className="table table-striped table-bordered table-condensed">
                    <thead>
                      <tr>
                        <td><strong>Item</strong></td>
                        <td><strong>Rate</strong></td>
                        <td><strong>Qty</strong></td>
                        <td><strong>Value</strong></td>
                      </tr>
                    </thead>
                    <tbody>
                      {
                      order.products.map((product, index) => {
                        if (product.quantity > 0) {
                          return (
                            <tr key={`gob-${index}`}>
                              <td>{`${product.name}, ${product.unitOfSale}`}</td>
                              <td>{formatMoney(product.unitprice, accountSettings)}</td>
                              <td>{`${displayUnitOfSale(product.quantity, product.unitOfSale)}`}</td>
                              <td>{formatMoney(product.unitprice * product.quantity, accountSettings)}</td>
                            </tr>
                          );
                        }
                      })
                    }
                      <tr>
                        <td className="no-line text-right" colSpan="3">
                          <strong>Amount:</strong>
                        </td>
                        <td className="no-line">
                          <strong>{formatMoney(order.total_bill_amount, accountSettings)}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="row">
                  <div className="col-12">
                    {order.comments}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>,
);

const generateOrderBills = (ordersToPrint /* selected list of orders */) => {
  let htmlReport = getHeader();
  _.each(ordersToPrint, (order, key) => {
    htmlReport += readyOrderToPrint(ordersToPrint[key]);
  }, this, htmlReport);
  htmlReport += getFooter();
  // this.suvaiA4Report.printHTMLReport(htmlReport);
  const reportWindow = window.open('', 'ReportWindow');
  reportWindow.document.write(htmlReport);
};

export default generateOrderBills;

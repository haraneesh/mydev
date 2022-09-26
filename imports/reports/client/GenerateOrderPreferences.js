import React from 'react';
import { formatMoney } from 'accounting-js';
import ReactDOMServer from 'react-dom/server';
import moment from 'moment';
import { dateSettings } from '../../modules/settings';
import 'moment-timezone';

// ------ Download Order Summary------- //
const orderPreferencesCSV = (orderPreferences) => {
  const csv = [];
  csv.push(
    'Index,'
    + 'Customer Name,'
    + 'Mobile Number,'
    + 'Order Status,'
    + 'Collect Recyclables,'
    + 'Collect Cash,'
    + 'Packing Preference,'
    + 'Feedback On Previous Order,'
    + 'Comments on Order',
  );
  orderPreferences.forEach((orderPreference, index) => {
    const {
      name,
      mobilePhone,
      orderStatus,
      collectRecyclablesWithThisDelivery,
      payCashWithThisDelivery,
      packingPreference,
      issuesWithPreviousOrder,
      comments,
    } = orderPreference;
    csv.push(
      `${index + 1},`
        + `${name},`
        + `${mobilePhone},`
        + `${orderStatus},`
        + `${collectRecyclablesWithThisDelivery},`
        + `${payCashWithThisDelivery},`
        + `${packingPreference},`
        + `${(issuesWithPreviousOrder) || ''},`
        + `${(comments) || ''}`,
    );
  });

  return csv;
};

export const downloadOrderPreferences = (orderPreferences, dateValue) => {
  const csv = orderPreferencesCSV(orderPreferences);
  const element = document.createElement('a');

  element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv.join('\r\n'))}`);
  element.setAttribute('download', `OrderSummary_${moment(dateValue).tz(dateSettings.timeZone).format(dateSettings.dayWithoutTime)}.csv`);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};
// ------ Print Order Summary------- //
const getHeader = () => '<!DOCTYPE html> <html><title>Product List | Suvai</title> <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"> <head></head><body>';
const getFooter = () => '</body></html>';

const printOrderPreferences = (orderPreferences, dateValue) => ReactDOMServer.renderToStaticMarkup(
  <div className="container">
    <div className="row">
      <div className="invoice-title">
        <div className="col-xs-8">
          <h2>Suvai Order Preferences</h2>
        </div>
        <div className="col-xs-4">
          <h3 className="pull-right">
            {moment(dateValue).tz(dateSettings.timeZone).format(dateSettings.format)}
          </h3>
        </div>
      </div>
    </div>
    <div className="row">
      <div className="col-md-12">
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title"><strong>Product List</strong></h3>
          </div>
          <div className="panel-body">
            <div className="table-responsive">
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <td><strong>Index</strong></td>
                    <td><strong>Customer Name</strong></td>
                    <td><strong>Mobile Number</strong></td>
                    <td><strong>Order Status</strong></td>
                    <td><strong>Collect Recyclables</strong></td>
                    <td><strong>Collect Cash</strong></td>
                    <td><strong>Packing Preference</strong></td>
                    <td><strong>Feedback On Previous Order</strong></td>
                    <td><strong>Comments on Order</strong></td>
                  </tr>
                </thead>
                <tbody>
                  {
                    orderPreferences.map((orderPreference, index) => (
                      <tr key={`ordPref-${index}`}>
                        <td>{index + 1}</td>
                        <td>{orderPreference.name}</td>
                        <td>{orderPreference.mobilePhone}</td>
                        <td>{orderPreference.orderStatus}</td>
                        <td>{orderPreference.collectRecyclablesWithThisDelivery}</td>
                        <td>{orderPreference.payCashWithThisDelivery}</td>
                        <td>{orderPreference.packingPreference}</td>
                        <td>{orderPreference.issuesWithPreviousOrder}</td>
                        <td>{orderPreference.comments}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>,
);

export const generateOrderPreferences = (orderPreferences, dateValue) => {
  let htmlReport = getHeader();
  htmlReport += printOrderPreferences(orderPreferences, dateValue);
  htmlReport += getFooter();
  const reportWindow = window.open('', 'OpenOrderPreferencesWindows');
  reportWindow.document.write(htmlReport);
};

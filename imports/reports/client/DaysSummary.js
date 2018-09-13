import React from 'react';
import ReactDOMServer from 'react-dom/server';
import moment from 'moment';
import 'moment-timezone';
import { Label } from 'react-bootstrap';
import { dateSettingsWithTime } from '../../modules/settings';

const getHeader = () => '<!DOCTYPE html> <html> <title>Days Summary | Suvai</title> <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"> <head></head><body>';
const getFooter = () => '</body></html>';

const calcBalanceAfterOrder = (
  orderedQuantity = 0,
  stockOnHand = 0,
  availableIncomingToday = 0,
  availableIncomingTomorrow = 0,
) => {
  const returnValue = (stockOnHand + availableIncomingToday + availableIncomingTomorrow) - orderedQuantity;
  return (Math.round(returnValue * 100) / 100);
  // return (returnValue);
};

const addRowHeaders = () => (
  <tr>
    <td className="text-center"><strong>Product Name</strong></td>
    <td className="text-center"><strong>Unit of Sale</strong></td>
    <td className="text-right"><strong>Customer Ordered</strong></td>
    <td className="text-right"><strong>Stock On Hand</strong></td>
    <td className="text-right"><strong>Incoming Today</strong></td>
    <td className="text-right"><strong>After Incoming Today</strong></td>
    <td className="text-right"><strong>Incoming Tomorrow</strong></td>
    <td className="text-right"><strong>After Incoming Tomorrow</strong></td>
  </tr>
);

const withWarningLabel = (showWarning, value) => (
  (showWarning) ? <Label bsStyle="danger"> {value} </Label> : value
);

const addRowDetails = rowsDetails => rowsDetails.map(
  ({ name, unitOfSale, orderQuantity, stockOnHand, poOrderedQtyForToday, poOrderedQtyForTomorrow }) => {
    const balanceAfterToday = calcBalanceAfterOrder(orderQuantity, stockOnHand, poOrderedQtyForToday);
    const balanceAfterTomorrow = calcBalanceAfterOrder(orderQuantity, stockOnHand, poOrderedQtyForToday, poOrderedQtyForTomorrow);
    const warnToday = (balanceAfterToday < 0) ? 'text-danger' : '';
    const warnTomorrow = (balanceAfterTomorrow < 0) ? 'text-danger' : '';

    return (
      <tr>
        <td className="text-center">{name}</td>
        <td className="text-center">{unitOfSale}</td>
        <td className="text-right">{orderQuantity}</td>
        <td className="text-right">{stockOnHand || 0}</td>
        <td className="text-right">{poOrderedQtyForToday || 0}</td>
        <td className="text-right">{withWarningLabel(warnToday, balanceAfterToday)}</td>
        <td className="text-right">{poOrderedQtyForTomorrow || 0}</td>
        <td className="text-right">{withWarningLabel(warnTomorrow, balanceAfterTomorrow)}</td>
      </tr>
    );
  });

const writeDaysSummaryDetails = (rowsDetails, today) => ReactDOMServer.renderToStaticMarkup(
  <div className="container">
    <div className="row">
      <div className="invoice-title">
        <div className="col-xs-12">
          <h3>Suvai - Days Summary: Awaiting Fullfilment</h3>
        </div>
        <div className="col-xs-12">
          <h4>
            {`${moment(today).tz(dateSettingsWithTime.timeZone).format(dateSettingsWithTime.format)}`}
          </h4>
        </div>
      </div>
    </div>
    <div className="row">
      <div className="col-md-12">
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title"><strong>Days Summary</strong></h3>
          </div>
          <div className="panel-body">
            <div className="table-responsive">
              <table className="table table-condensed">
                <thead>
                  {
                    addRowHeaders()
                  }
                </thead>
                <tbody>
                  {
                    addRowDetails(rowsDetails)
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

const createDaysSummaryReport = (rowsDetails) => {
  let htmlReport = getHeader();

  htmlReport += writeDaysSummaryDetails(rowsDetails, new Date());

  htmlReport += getFooter();

  const reportWindow = window.open('', 'DailySummaryWindow');
  reportWindow.document.write(htmlReport);
};

export default createDaysSummaryReport;

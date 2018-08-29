import React from 'react';
import ReactDOMServer from 'react-dom/server';
import moment from 'moment';
import 'moment-timezone';
import { dateSettingsWithTime } from '../../modules/settings';

const getHeader = () => '<!DOCTYPE html> <html> <title>Days Summary | Suvai</title> <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"> <head></head><body>';
const getFooter = () => '</body></html>';

const addRowHeaders = () => (
  <tr>
    <td className="text-center"><strong>Product Name</strong></td>
    <td className="text-center"><strong>Unit of Sale</strong></td>
    <td className="text-right"><strong>Ordered Quantity</strong></td>
    <td className="text-right"><strong>Stock On Hand</strong></td>
    <td className="text-right"><strong>PO Stock</strong></td>
  </tr>
);

const addRowDetails = rowsDetails => rowsDetails.map(rowDetail => (
  <tr>
    <td className="text-center">{rowDetail.name}</td>
    <td className="text-center">{rowDetail.unitOfSale}</td>
    <td className="text-right">{rowDetail.orderQuantity}</td>
    <td className="text-right">{rowDetail.stockOnHand ? rowDetail.stockOnHand : 0}</td>
    <td className="text-right">{rowDetail.poOrderedQuantity ? rowDetail.poOrderedQuantity : 0}</td>
  </tr>
));

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

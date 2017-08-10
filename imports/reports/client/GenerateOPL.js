import React from 'react';
import ReactDOMServer from 'react-dom/server';
import moment from 'moment';
import 'moment-timezone';
import { dateSettingsWithTime } from '../../modules/settings';

const getHeader = () => '<!DOCTYPE html> <html> <title>OPL Report | Suvai</title> <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"> <head></head><body>';
const getFooter = () => '</body></html>';

const writeOrderSummaryDetails = (rowsDetails, today) => ReactDOMServer.renderToStaticMarkup(
  <div className="container">
    <div className="row">
      <div className="invoice-title">
        <div className="col-xs-12">
          <h3>Suvai - OPL Report, Status Considered: Awaiting Fullfilment</h3>
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
            <h3 className="panel-title"><strong>Order Planning List</strong></h3>
          </div>
          <div className="panel-body">
            <div className="table-responsive">
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <td className="text-center"><strong>Product Name</strong></td>
                    <td className="text-center"><strong>Unit of Sale</strong></td>
                    <td className="text-right"><strong>Total Quantity</strong></td>
                  </tr>
                </thead>
                <tbody>
                  {
                     rowsDetails.map((rowDetail) => {
                       if (rowDetail.totalQuantity > 0) {
                         return (
                           <tr>
                             <td className="text-center">{rowDetail._id.productName}</td>
                             <td className="text-center">{rowDetail._id.productUnitOfSale}</td>
                             <td className="text-right">{rowDetail.totalQuantity}</td>
                           </tr>
                         );
                       }
                     })
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const generateOPL = (rowsDetails) => {
  let htmlReport = getHeader();

  htmlReport += writeOrderSummaryDetails(rowsDetails, new Date());

  htmlReport += getFooter();

  const reportWindow = window.open('', 'ReportWindow');
  reportWindow.document.write(htmlReport);
};

export default generateOPL;

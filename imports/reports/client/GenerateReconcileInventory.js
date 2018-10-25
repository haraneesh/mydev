import React from 'react';
import ReactDOMServer from 'react-dom/server';
import moment from 'moment';
import 'moment-timezone';
import { dateSettingsWithTime } from '../../modules/settings';

const getHeader = () => '<!DOCTYPE html> <html> <title>RC Report | Suvai</title> <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"> <head></head><body>';
const getFooter = () => '</body></html>';

const writeOrderSummaryDetails = (products, displayDate) => ReactDOMServer.renderToStaticMarkup(
  <div className="container">
    <div className="row">
      <div className="invoice-title">
        <div className="col-xs-12">
          <h3>Suvai - Reconcile Inventory</h3>
        </div>
        <div className="col-xs-12">
          <h4>
            {`${displayDate}`}
          </h4>
        </div>
      </div>
    </div>
    <div className="row">
      <div className="col-md-12">
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title"><strong>Reconcile Inventory Report</strong></h3>
          </div>
          <div className="panel-body">
            <div className="table-responsive">
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <td className="text-center"><strong>Product Name</strong></td>
                    <td className="text-center"><strong>Unit of Sale</strong></td>
                    <td className="text-right"><strong>Quantity in Zoho</strong></td>
                    <td className="text-right"><strong>Physical Quantity</strong></td>
                    <td className="text-right"><strong>Difference</strong></td>
                  </tr>
                </thead>
                <tbody>
                  {
                     products.map((item) => {
                        const alert = (item.differenceQty < 0) ? 'bg-warning' : '';
                         return (
                           <tr>
                             <td className="text-center">{item.productName}</td>
                             <td className="text-center">{item.unit}</td>
                             <td className="text-right">{item.zohoProductInventory}</td>
                             <td className="text-right">{item.reportedPhysicalInventory}</td>
                             <td className={`${alert} text-right`}>{item.differenceQty}</td>
                           </tr>
                         );
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

const generateRCInven = (item, displayDate) => {
  let htmlReport = getHeader();

  htmlReport += writeOrderSummaryDetails(item.products, displayDate);

  htmlReport += getFooter();

  const reportWindow = window.open('', 'Inventory Reconciliation Report');
  reportWindow.document.write(htmlReport);
};

export default generateRCInven;

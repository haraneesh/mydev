import React from 'react';
import ReactDOMServer from 'react-dom/server';
import moment from 'moment';
import 'moment-timezone';
import { dateSettingsWithTime } from '../../modules/settings';
import { displayUnitOfSale } from '../../modules/helpers';

const getHeader = () => '<!DOCTYPE html> <html> <head> ' +
  ' <title>OPL By Product Type | Suvai</title> ' +
   '<link rel="stylesheet" type="text/css" ' +
   'href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />' +
   '</head><body>';

const getFooter = () => '</body></html>';

const addProductRows = rowsDetails => rowsDetails.map((rowDetail, index, theArray) => {
  if (rowDetail.totalCount > 0) {
    const rows = [];
    const prevIndex = (index > 0) ? index - 1 : 0;
    if (index === 0 || theArray[prevIndex]._id.productType !== rowDetail._id.productType) {
      rows.push(<tr>
        <td className="text-left">
          <strong> {rowDetail._id.productType} </strong>
        </td>
        <td />
        <td />
      </tr>);
    }
    rows.push(
      <tr>
        <td className="text-left">{rowDetail._id.productName}</td>
        <td className="text-center"> {displayUnitOfSale(rowDetail._id.productQuantity, rowDetail._id.productUnitOfSale)} </td>
        <td className="text-center"> {rowDetail.totalCount} </td>
      </tr>);

    return (rows);
  }
});


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
                    <td className="text-left"><strong>Product Name</strong></td>
                    <td className="text-center"><strong>Quantity</strong></td>
                    <td className="text-center"><strong>Count</strong></td>
                  </tr>
                </thead>
                <tbody>
                  {addProductRows(rowsDetails)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>,
);

const GenerateOPLByProductType = (rowsDetails) => {
  let htmlReport = getHeader();

  htmlReport += writeOrderSummaryDetails(rowsDetails, new Date());

  htmlReport += getFooter();

  const reportWindow = window.open('', 'GenerateOPLByProductType');
  reportWindow.document.write(htmlReport);
};

export default GenerateOPLByProductType;

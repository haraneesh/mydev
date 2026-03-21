import React from 'react';
import ReactDOMServer from 'react-dom/server';
import moment from 'moment';
import 'moment-timezone';
import { dateSettingsWithTime } from '../../modules/settings';
import { displayUnitOfSale } from '../../modules/helpers';

const getHeader = () => '<!DOCTYPE html> <html> <head> '
  + ' <title>OPL By Product Type | Suvai</title> '
  + '<link rel="stylesheet" type="text/css" '
  + 'href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />'
  + '</head><body>';

const getFooter = () => '</body></html>';
let heading = '';

const addProductRows = (rowsDetails) => rowsDetails.map((rowDetail) => {
  // if (rowDetail.totalCount > 0) {
  const rows = [];
  if (heading !== rowDetail._id.productName) {
    heading = rowDetail._id.productName;
    rows.push(<tr>
      <td className="text-left">
        <strong>
          {' '}
          {rowDetail._id.productName}
          {' '}
        </strong>
      </td>
      <td />
              </tr>);
  }
  rows.push(
    <tr>
      { /* <td className="text-left">{rowDetail._id.productName}</td> */}
      <td className="text-left">
        {' '}
        {rowDetail._id.customerName}
        {' '}
      </td>
      <td className="text-center">
        {' '}
        {displayUnitOfSale(rowDetail.productQuantity, rowDetail.productUnitOfSale)}
        {' '}
      </td>
    </tr>,
  );

  return (rows);
  // }
});

const writeOrderSummaryDetails = (rowsDetails, today, type) => ReactDOMServer.renderToStaticMarkup(
  <div className="container">
    <div className="row">
      <div className="invoice-title">
        <div className="col-12">
          <h3>
            {' '}
            {`${type} Suvai - OPL Report, Status Considered: Awaiting Fullfilment`}
          </h3>
        </div>
        <div className="col-12">
          <h4>
            {`${moment(today).tz(dateSettingsWithTime.timeZone).format(dateSettingsWithTime.format)}`}
          </h4>
        </div>
      </div>
    </div>
    <div className="row">
      <div className="col-md-12">
        <div className="card">
          <div className="card-body">
            <h3 className="card-title"><strong>Order Planning List</strong></h3>
            <div className="card-text">
              <div className="table-responsive">
                <table className="table table-striped table-bordered table-condensed">
                  {/* <thead>
                 <tr>
                     <td className="text-left"><strong>Product Name</strong></td>
                    <td className="text-left"><strong> Type / Customer Name</strong></td>
                    <td className="text-center"><strong>Quantity</strong></td>
                  </tr>
                </thead> */}
                  <tbody>
                    {addProductRows(rowsDetails)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>,
);

const GenerateOPLByProductType = (rowsDetails, isWholeSale) => {
  const type = (isWholeSale) ? 'WHOLESALE' : ' RETAIL';
  let htmlReport = getHeader(type);

  htmlReport += writeOrderSummaryDetails(rowsDetails, new Date(), type);

  htmlReport += getFooter();

  const reportWindow = window.open('', 'GenerateOPLByProductType');
  reportWindow.document.write(htmlReport);
};

export default GenerateOPLByProductType;

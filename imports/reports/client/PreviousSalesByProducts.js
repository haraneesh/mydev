import React from 'react';
import ReactDOMServer from 'react-dom/server';
import moment from 'moment';
import 'moment-timezone';
import { displayUnitOfSale } from '../../modules/helpers';
import { dateSettingsWithTime } from '../../modules/settings';

const getHeader = () => '<!DOCTYPE html> <html> <title>Days Summary | Suvai</title> <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"> <head></head><body>';
const getFooter = () => '</body></html>';

const addRowHeaders = (forDay) => (
  <tr>
    <td className="text-center"><strong>Product Name</strong></td>
    <td className="text-right">
      <strong>
        Two Weeks (
        {forDay}
        )
      </strong>
    </td>
    <td className="text-right">
      <strong>
        Prev Weeks (
        {forDay}
        )
      </strong>
    </td>
  </tr>
);

const addRowDetails = (rowsDetails) => rowsDetails.map(({
  name, unitOfSale, firstWeek, secondWeek,
}) => (
  <tr>
    <td className="text-center">{name}</td>
    <td className="text-right">
      {(secondWeek && secondWeek.orderQuantity) ? displayUnitOfSale(secondWeek.orderQuantity, unitOfSale) : 0}
    </td>
    <td className="text-right">
      {(firstWeek && firstWeek.orderQuantity) ? displayUnitOfSale(firstWeek.orderQuantity, unitOfSale) : 0}
    </td>
  </tr>
));

const writeDetails = (forDay, rowsDetails, today) => ReactDOMServer.renderToStaticMarkup(
  <div className="container">
    <div className="row">
      <div className="invoice-title">
        <div className="col-xs-12">
          <h3>Suvai - Previous Week Orders</h3>
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
            <h3 className="panel-title"><strong>Previous Week's Orders</strong></h3>
          </div>
          <div className="panel-body">
            <div className="table-responsive">
              <table className="table table-condensed">
                <thead>
                  {
                    addRowHeaders(forDay)
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

const previousSalesByProducts = (forDay, rowsDetails) => {
  let htmlReport = getHeader();

  htmlReport += writeDetails(forDay, rowsDetails, new Date());

  htmlReport += getFooter();

  const reportWindow = window.open('', 'PreviousSalesByProducts');
  reportWindow.document.write(htmlReport);
};

export default previousSalesByProducts;

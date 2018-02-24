import React from 'react';
import { formatMoney } from 'accounting-js';
import { accountSettings, dateSettings } from '../../modules/settings';
import { displayUnitOfSale } from '../../modules/helpers';
import ReactDOMServer from 'react-dom/server';
import moment from 'moment';
import 'moment-timezone';

const _getHeader = () => '<!DOCTYPE html> <html><title>Product List | Suvai</title> <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"> <head></head><body>';
const _getFooter = () => '</body></html>';

const groupProductsByType = (products) => {
   // Grouping product categories by tabs
    const productsByCat = {};

    _.map(products, (product, index) => {

       if (!productsByCat[product.type]){
         productsByCat[product.type] = [];
       }

       productsByCat[product.type].push(product);
  });
  return productsByCat;
};


const _readyProductsToPrint = (productsByCat, dateValue) => ReactDOMServer.renderToStaticMarkup(
  <div className="container">
    <div className="row">
      <div className="invoice-title">
        <div className="col-xs-8">
          <h2>Suvai Product List</h2>
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
                    <td><strong>Product Name</strong></td>
                    <td className="text-right"><strong>Price</strong></td>
                  </tr>
                </thead>
                <tbody>
                  { 
                      _.map(productsByCat, (products, index) => {
                        return (products.map((product, index) => (
                            <tr key={`gob-${index}`}>
                              <td>{`${product.name} ${product.unitOfSale}`}</td>
                              <td className="text-right">{formatMoney(product.unitprice, accountSettings)}</td>
                            </tr>
                          )));   
                      })
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

const generateOrderList = (products /* products whose details to print */, dateValue) => {
  let htmlReport = _getHeader();
  htmlReport += _readyProductsToPrint(groupProductsByType(products), dateValue);
  htmlReport += _getFooter();
    // this.suvaiA4Report.printHTMLReport(htmlReport);
  const reportWindow = window.open('', 'ReportWindow');
  reportWindow.document.write(htmlReport);
};

export default generateOrderList;

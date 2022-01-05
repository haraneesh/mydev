import { Meteor } from 'meteor/meteor';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import moment from 'moment';
import constants from '../../modules/constants';
import 'moment-timezone';
import { dateSettingsWithTime } from '../../modules/settings';
import { displayUnitOfSale, getFormattedMoney } from '../../modules/helpers';

const getHeader = () => '<!DOCTYPE html> <html> <head> <title>Product Price List | Suvai</title> <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous" /> </head><body>';
const getFooter = () => '</body></html>';

class GeneratePriceList {
    static addRowHeaders = () => (
      <>
        <th />
        <th className="text-center">Product Name</th>
        <th className="text-center">Unit</th>
        <th className="text-center">Price</th>
      </>
    )

  static addRowDetails = (products) => {
    const { ReturnProductType } = constants;
    let productType = '';
    return products.map(
      ({
        name, unitOfSale, unitprice, type, image_path, availableToOrder,
      }) => {
        const imagePath = `${Meteor.settings.public.Product_Images}${image_path}?${Meteor.settings.public.Product_Images_Version}`;
        const imageRow = (<img src={imagePath} alt="" className="item-image no-aliasing-image img-responsive" style={{ height: '75px' }} />);

        if (ReturnProductType.name !== type && availableToOrder) {
          const prevProductType = productType;
          if (type !== productType) {
            productType = type;
          }
          return (
            <>
              {(prevProductType !== type)
                ? (
                  <tr>
                    <td colSpan={4} className="text-center bg-success">
                      <h5 className="text-white">{type}</h5>
                    </td>
                  </tr>
                )
                : <></> }
              <tr>
                <td>{imageRow}</td>
                <td>{name}</td>
                <td>{displayUnitOfSale(1, unitOfSale)}</td>
                <td>{getFormattedMoney(unitprice)}</td>
              </tr>
            </>
          );
        }
        return (<></>);
      },
    );
  }

  static reportDetails = ({ products }) => ReactDOMServer.renderToStaticMarkup(
    <div className="container">
      <div className="row">
        <div className="invoice-title">
          <div className="col-xs-12">
            <h3>Suvai - Price List</h3>
          </div>
          <div className="col-xs-12">
            <h4>
              {`${moment(new Date()).tz(dateSettingsWithTime.timeZone).format(dateSettingsWithTime.format)}`}
            </h4>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <div className="panel panel-default">
            <div className="panel-body">
              <table className="table table-bordered table-striped">
                <thead className="thead-dark">
                  {
                      this.addRowHeaders()
                    }
                </thead>
                <tbody>
                  {
                      this.addRowDetails(products)
                    }
                </tbody>
              </table>

            </div>
          </div>
        </div>
      </div>
    </div>,
  );

    static createReport = ({ products }) => {
      let htmlReport = getHeader();

      htmlReport += this.reportDetails({ products });

      htmlReport += getFooter();

      const reportWindow = window.open('', 'ProductList');
      reportWindow.document.write(htmlReport);
    };
}

export default GeneratePriceList.createReport;

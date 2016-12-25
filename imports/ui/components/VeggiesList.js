import React from 'react';
import { Glyphicon, Alert } from 'react-bootstrap';
import {formatMoney} from 'accounting-js';
import {accountSettings} from '../../modules/settings';
import QuantitySelector from './orders/QuantitySelector';

const VeggiesList = ({ veggies }) =>(
  veggies.length > 0 ? <div>{veggies.map(({ sku,name,image,description,unit,unitprice,vendor }) => (
    <div className="row">
      <div className="col-xs-2"><img className="img-responsive" src={"/veggies/" + image} /> </div>
      <div className="col-xs-4">
        <h4 className="product-name"><strong>{name + " " + unit}</strong></h4><h4><small>{description}</small></h4>
      </div>
      <div className="col-xs-6">
        <div className="col-xs-6 text-right">
          <h4>{formatMoney(unitprice,accountSettings)} <span className="text-muted">x</span></h4>
        </div>
        <div className="col-xs-4">
          <QuantitySelector />
        </div>
        <div className="col-xs-2">
          <button type="button" className="btn btn-link">
            	<Glyphicon glyph="glyphicon glyphicon-trash" />
          </button>
        </div>
      </div>
    </div>
  ))}</div>:
      <Alert bsStyle="warning">No veggies yet.</Alert>
);

VeggiesList.propTypes = {
  veggies: React.PropTypes.array,
};

export default VeggiesList;

import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import VeggiesList from '../containers/VeggiesList.js';
import {formatMoney} from 'accounting-js';
import {accountSettings} from '../../modules/settings';


const Veggies = () => (
  <div className="container">
    <div className="row">
      <div className="col-xs-12">
        <h3 className="page-header">Ordering List</h3>
      </div>
    </div>
	<div className="row">
		<div className="col-xs-12">
			<div className="panel">
				<div className="panel-body">
          <VeggiesList />
  				</div>
  				<div className="panel-footer">
  					<div className="row text-center">
  						<div className="col-xs-9">
  							<h4 className="text-right">Total <strong>{
                    formatMoney(50,accountSettings)
                  }</strong></h4>
  						</div>
  						<div className="col-xs-3">
  							<button type="button" className="btn btn-success btn-block">
  								Place Order
  							</button>
  						</div>
  					</div>
  				</div>
  			</div>
  		</div>
  	</div>
  </div>

);

export default Veggies;

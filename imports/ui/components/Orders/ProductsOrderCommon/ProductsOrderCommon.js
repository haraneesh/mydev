import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, FormControl, PanelGroup } from 'react-bootstrap';
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../../modules/settings';


export const OrderFooter = ({ totalBillAmount, onButtonClick, submitButtonName, onBackClick }) => (
    <div className="orderFooter">
      {onBackClick && (<Col sm={4} xs={12} className="visible-sm visible-md visible-lg">
          <Button  onClick={onBackClick} className="btn-block">← Back</Button>
        </Col>)}
      {onBackClick && (<Col sm={4}>
        <h4 className="text-right-not-xs">{`Total `}
            <strong>
            {
              formatMoney(totalBillAmount, accountSettings)
            }
            </strong></h4>
      </Col>)}
      <Col className="text-right-not-xs" sm={4}  smOffset={onBackClick?0:8} xs={12}>
        <Button bsStyle="primary" style={{marginBottom:"0.5em", marginTop:"0.5em"}} 
          disabled={totalBillAmount <= 0} 
          onClick={onButtonClick} className="btn-block">
            { submitButtonName }
          </Button>
      </Col>
      {onBackClick && (<Col sm={4} xs={12} className="visible-xs ">
          <Button  onClick={onBackClick} className="btn-block">← Back</Button>
        </Col>)
      }
    </div>
);

OrderFooter.propTypes = {
  onButtonClick: PropTypes.func.isRequired,
  totalBillAmount: PropTypes.number.isRequired,
  submitButtonName: PropTypes.string.isRequired,
};


export const DisplayCategoryHeader = ({ clName, title, onclick, isOpen }) => (
  <Row onClick={onclick} className="productCatHead">
    <Col xs={3} className={`productCat_${clName}`} />
    <Col xs={8} className="prodCatTitle"> 
      <p style={{ marginBottom: '0px' }}> <span style={{ verticalAlign: 'middle' }}> {title} </span> </p> 
    </Col>
    <Col xs={1} className="prodCatPlus"> 
      <span className="text-default">
        {!!isOpen && (<b className="fa fa-angle-up" style={{fontSize:'1.5em'}} />)}
        {!isOpen && (<b className="fa fa-angle-down" style={{fontSize:'1.5em'}} />)}
      </span> 
    </Col>
  </Row>
);

DisplayCategoryHeader.propTypes = {
  clName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onclick: PropTypes.func.isRequired,
  isOpen: PropTypes.func.isRequired
}

export const OrderComment = ({ comments }) => (
    <PanelGroup>
    <Row>
      <Col sm={3}>
        <h4 className="noMarginNoPadding">
          <strong> Comments </strong>
        </h4>
      </Col>
      <Col sm={9}>
        <FormControl
          name="comments"
          componentClass="textarea"
          placeholder="Is there anything that you would like to tell us about this order?"
          defaultValue={comments}
          rows="4"
        />
      </Col>
    </Row>
    </PanelGroup>
);

OrderComment.propTypes = {
  comments: PropTypes.string.isRequired,
}
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Glyphicon, FormControl, PanelGroup } from 'react-bootstrap';
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../../modules/settings';


export const OrderFooter = ({ totalBillAmount, onButtonClick, submitButtonName, onBackClick }) => (
    <Row>
      <Col sm={8}>
        <h4 className="text-right-not-xs">Total <strong>{
                  formatMoney(totalBillAmount, accountSettings)
                }</strong></h4>
      </Col>
      <Col className="text-right-not-xs" sm={4} xs={12}>
        <Button bsStyle="primary" disabled={totalBillAmount <= 0} onClick={onButtonClick} className="btn-block">
            { submitButtonName }
          </Button>
      </Col>
      {onBackClick && (<Col sm={4} xs={12}>
          <Button  style={{marginTop:"0.5em"}} onClick={onBackClick} className="btn-block">← Back</Button>
        </Col>)
      }
    </Row>
);

OrderFooter.propTypes = {
  onButtonClick: PropTypes.func.isRequired,
  totalBillAmount: PropTypes.number.isRequired,
  submitButtonName: PropTypes.string.isRequired,
};


export const DisplayCategoryHeader = ({ clName, title, onclick, isOpen }) => (
  <Row onClick={onclick} className="productCatHead">
    <Col xs={3} className={`productCat_${clName}`} />
    <Col xs={8} className="prodCatTitle"> <p style={{ marginBottom: '0px' }}> <span style={{ verticalAlign: 'middle' }}> {title} </span> </p> </Col>
    <Col xs={1} className="prodCatPlus"> <small> <Glyphicon glyph={isOpen ? 'minus' : 'plus'} /> </small> </Col>
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
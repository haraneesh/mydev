import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Glyphicon, FormControl, ListGroupItem } from 'react-bootstrap';
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../../modules/settings';


export const OrderFooter = ({ totalBillAmount, onButtonClick, submitButtonName }) => (
  <ListGroupItem>
    <Row>
      <Col sm={9}>
        <h4 className="text-right-not-xs">Total <strong>{
                  formatMoney(totalBillAmount, accountSettings)
                }</strong></h4>
      </Col>
      <Col sm={3}>
        <div className="text-right-not-xs">
          <Button bsStyle="primary" disabled={totalBillAmount <= 0} onClick={onButtonClick}>
            { submitButtonName }
          </Button>
        </div>
      </Col>
    </Row>
  </ListGroupItem>
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
  <ListGroupItem>
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
        />
      </Col>
    </Row>
  </ListGroupItem>
);

OrderComment.propTypes = {
  comments: PropTypes.string.isRequired,
}
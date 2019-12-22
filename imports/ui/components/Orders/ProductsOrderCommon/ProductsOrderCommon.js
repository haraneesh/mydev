import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, FormControl, PanelGroup } from 'react-bootstrap';
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../../modules/settings';
import constants from '../../../../modules/constants';


export const OrderFooter = ({ isMobile, totalBillAmount, onButtonClick, submitButtonName, onSecondButtonClick, isMainProductListPage }) => {
  if (isMainProductListPage) {
    return (
      <Row style={{ marginTop: isMobile ? '0em' : '2.5em' }}>
        <Col className="text-left-not-xs" sm={4} xs={12}>
          {/* } <Button
            bsStyle="default"
            style={{ marginBottom: '0.5em' }}
            disabled={totalBillAmount <= 0}
            onClick={onSecondButtonClick}
            className="btn-block"
          > Save Draft
          </Button> */}
        </Col>

        <Col className="text-right-not-xs" sm={4} smOffset={4} xs={12}>
          <Button
            bsStyle="primary"
            disabled={totalBillAmount <= 0}
            onClick={onButtonClick}
            className="btn-block"
          > { submitButtonName }
          </Button>
        </Col>
      </Row>
    );
  }
  return (
    <div className="orderFooter">
      {onSecondButtonClick && (<Col sm={4}>
        <h4 className="text-right-not-xs">{'Total '}
          <strong>
            {
                formatMoney(totalBillAmount, accountSettings)
            }
          </strong></h4>
      </Col>)}
      <Col className="text-right-not-xs" sm={4} xs={12}>
        <Button
          bsStyle="primary"
          style={{ marginBottom: '0.5em', marginTop: '0.5em' }}
          disabled={totalBillAmount <= 0}
          onClick={() => { onButtonClick(constants.OrderStatus.Pending.name); }}
          className="btn-block"
        >
          { submitButtonName }
        </Button>
      </Col>
    </div>
  );
};

OrderFooter.defaultProps = {
  onSecondButtonClick: {},
};

OrderFooter.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  onButtonClick: PropTypes.func.isRequired,
  onSecondButtonClick: PropTypes.func,
  totalBillAmount: PropTypes.number.isRequired,
  submitButtonName: PropTypes.string.isRequired,
  isMainProductListPage: PropTypes.bool.isRequired,
};


export const DisplayCategoryHeader = ({ clName, title, onclick, isOpen }) => (
  <Row onClick={onclick} className="productCatHead">
    <Col xs={3} sm={2} className={`productCat_${clName}`} />
    <Col xs={8} sm={9} className="prodCatTitle">
      <p style={{ marginBottom: '0px' }}> <span style={{ verticalAlign: 'middle' }}> {title} </span> </p>
    </Col>
    <Col xs={1} className="prodCatPlus">
      <span className="text-default">
        {!!isOpen && (<b style={{ fontSize: '1.5em' }} > - </b>)}
        {!isOpen && (<b style={{ fontSize: '1.5em' }} > + </b>)}
      </span>
    </Col>
  </Row>
);

DisplayCategoryHeader.propTypes = {
  clName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onclick: PropTypes.func.isRequired,
  isOpen: PropTypes.func.isRequired,
};

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
;

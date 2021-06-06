import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { withTracker } from 'meteor/react-meteor-data';
import {
  Panel, Label, Alert, Row, Col, Glyphicon, Button,
} from 'react-bootstrap';
import * as timeago from 'timeago.js';
import constants from '../../../modules/constants';
import { dateSettings } from '../../../modules/settings';
import SuppOrdersCollection from '../../../api/SupplierOrders/SupplierOrders';
import WelcomeMessage from '../../components/WelcomeMessage/WelcomeMessage';
import AggregateSupplierOrdersCSV from '../../../reports/client/AggregateSupplierOrdersCSV';

import Loading from '../../components/Loading/Loading';

const PAGE_LENGTH_SIZE = 20;
const reactVar = new ReactiveVar(
  {
    pageNumber: 1,
    bringCompleted: false,
  },
);

const bringNextBatch = () => {
  const rVar = reactVar.get();
  reactVar.set({
    pageNumber: rVar.pageNumber + 1,
  });
};

const showCompletedView = (showCompleted) => {
  reactVar.set({
    pageNumber: 1,
    bringCompleted: showCompleted,
  });
};

const SupplierOrders = ({
  loading, loggedInUser, suppOrders, showLoadMore, history,
}) => (!loading ? (
  <div className="SupplierHome">
    <WelcomeMessage loggedInUser={loggedInUser} />
    <div className="page-header clearfix">
      <Row style={{ marginBottom: '1rem' }}>
        <Col xs={6}>
          <h4 style={{ margin: '0px' }}>Orders</h4>
        </Col>
        <Col xs={6}>
          <Button bsStyle="primary" className="btn-sm" onClick={() => { AggregateSupplierOrdersCSV({ suppOrders }); }}>
            Export Excel
          </Button>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <button type="button" className="btn btn-sm btn-link" onClick={() => { showCompletedView(false); }}>Not completed</button>
          <button type="button" className="btn btn-sm btn-link" onClick={() => { showCompletedView(true); }}>Completed</button>
        </Col>
      </Row>
      {
        suppOrders.map((suppOrder) => (

          <Panel
            key={suppOrder.createdAt}
            style={{ margin: '0px', textAlign: 'left', padding: '1rem' }}
            onClick={() => { history.push(`/order/${suppOrder._id}`); }}
          >
            <Row>
              <Col xs={11}>
                <Col xs={6} sm={6} md={3} className="remLeftRightPad">
                  <Label bsStyle={constants.OrderStatus[suppOrder.order_status].label}>
                    {constants.OrderStatus[suppOrder.order_status].display_value}
                  </Label>
                </Col>
                <Col xs={6} sm={6} md={3} style={{ paddingTop: '0.5rem', textAlign: 'right' }}>
                  {timeago.format(suppOrder.createdAt, dateSettings.timeZone)}
                </Col>
                <Col xs={12}>{suppOrder.customer_details.name}</Col>
              </Col>
              <Col xs={1}>
                <span className="text-muted" style={{ paddingLeft: '1rem', lineHeight: '4rem' }}>
                  <Glyphicon glyph="chevron-right" bsSize="large" />
                </span>
              </Col>
            </Row>
          </Panel>
        ))
      }
      {(showLoadMore) && (
      <Row style={{ marginTop: '2em' }}>
        <Button className="btn-sm" onClick={() => { bringNextBatch(); }}>
          Load More
        </Button>
      </Row>
      )}
      {(suppOrders.length === 0) && (
        <Alert bsStyle="warning">No Orders yet!</Alert>)}
    </div>
  </div>
) : <Loading />);

SupplierOrders.propTypes = {
  loading: PropTypes.bool.isRequired,
  loggedInUser: PropTypes.string.isRequired,
  showLoadMore: PropTypes.bool.isRequired,
  suppOrders: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker((args) => {
  const rVar = reactVar.get();
  const limit = rVar.pageNumber * PAGE_LENGTH_SIZE;
  const subscription = Meteor.subscribe('supplierOrders.list', {
    bringCompleted: rVar.bringCompleted,
    limit,
  });

  const suppOrders = SuppOrdersCollection.find({},
    { sort: { createdAt: constants.Sort.DESCENDING } }).fetch();

  return {
    loading: !subscription.ready(),
    history: args.history,
    showLoadMore: suppOrders.length >= limit,
    suppOrders,
  };
})(SupplierOrders);

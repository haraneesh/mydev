import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import {
  Panel, Row, Col, Button,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import createDaysSummaryReport from '../../../../reports/client/DaysSummary';
import previousSalesByProducts from '../../../../reports/client/PreviousSalesByProducts';
import Loading from '../../../components/Loading/Loading';

// import './ReportsHome.scss';

const ReportsHome = () => {
  const [loading, setLoading] = useState(false);

  function genDaysSummaryReport() {
    if (!loading) {
      Meteor.call('reports.generateDaysSummary', (error, success) => {
        if (error) {
          toast.error(error.reason);
        } else {
          const rowsDetails = Object.values(success);
          if (rowsDetails.length > 0) {
            createDaysSummaryReport(rowsDetails);
          } else {
            const message = 'There are no orders in Awaiting Fullfilment status';
            toast.success(message, 'default');
          }
        }
        setLoading(false);
      });
    }
    setLoading(true);
  }

  function listInvoicesPerMonth() {
    if (!loading) {
      Meteor.call('reports.getInvoices', (error, success) => {
        if (error) {
          toast.error(error.reason);
        } else {
          return success;
        }
        setLoading(false);
      });
    }
    setLoading(true);
  }

  function showPreviousSalesByProducts() {
    if (!loading) {
      Meteor.call('reports.getPreviousSalesByProduct', (error, success) => {
        if (error) {
          toast.error(error.reason);
        } else {
          const { val, day } = success;
          const rowsDetails = Object.values(val);
          if (rowsDetails.length > 0) {
            previousSalesByProducts(day, rowsDetails);
          } else {
            const message = 'There are no orders on previous days';
            toast.success(message, 'default');
          }
        }
        setLoading(false);
      });
    }
    setLoading(true);
  }

  return (
    <div className="ReportsHome">
      {(loading) ? (<Loading />) : (<div />)}
      <Row>
        <Col xs={12}>
          <div className="page-header clearfix">
            <h2 className="pull-left">Previous Orders</h2>
          </div>
          <Panel>
            <Button bsStyle="link" onClick={showPreviousSalesByProducts}>
              Previous Order Quantities
            </Button>
          </Panel>
        </Col>

        <Col xs={12}>
          <div className="page-header clearfix">
            <h2 className="pull-left">General Reports</h2>
          </div>
          <Panel>
            <Button bsStyle="link" onClick={genDaysSummaryReport}>Days Summary</Button>
          </Panel>
          <Panel>
            <Button bsStyle="link" href="/reconcileInventoryList">Inventory Reconciliation</Button>
          </Panel>
        </Col>

        <Col xs={12}>
          <div className="page-header clearfix">
            <h2 className="pull-left">Sales</h2>
          </div>
          <Panel>
            <Button bsStyle="link" onClick={listInvoicesPerMonth}>Sales</Button>
          </Panel>
        </Col>

      </Row>
    </div>
  );
};

export default ReportsHome;

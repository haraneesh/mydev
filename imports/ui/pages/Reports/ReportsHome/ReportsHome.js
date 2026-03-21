import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { daysInWeek } from '../../../../modules/helpers';
import createDaysSummaryReport from '../../../../reports/client/DaysSummary';
import previousSalesByProducts from '../../../../reports/client/PreviousSalesByProducts';
import { generateOrderPreferences, downloadOrderPreferences } from '../../../../reports/client/GenerateOrderPreferences';
import downloadUserList from '../../../../reports/client/ListOfUsers';
import Loading from '../../../components/Loading/Loading';

// import './ReportsHome.scss';

const weekday = daysInWeek();
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
      const reportForDayInWeek = document.getElementById('dayInWeek').value;

      Meteor.call('reports.getPreviousSalesByProduct', reportForDayInWeek, (error, success) => {
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

  function reportCustomerOrderPreferences(download) {
    if (!loading) {
      setLoading(true);
      Meteor.call('reports.reportCustomerOrderPreferences', (error, openOrderPreferences) => {
        if (error) {
          toast.error(error.reason);
        } else if (!download) {
          generateOrderPreferences(openOrderPreferences);
        } else {
          downloadOrderPreferences(openOrderPreferences);
        }
        setLoading(false);
      });
    }
  }

  function reportGetAllUsers() {
    if (!loading) {
      setLoading(true);
      Meteor.call('reports.getAllUsers', (error, allUsers) => {
        if (error) {
          toast.error(error.reason);
        } else {
          downloadUserList(allUsers, new Date());
        }
      });
    }
  }

  return (
    <div className="ReportsHome">
      {(loading) ? (<Loading />) : (<div />)}
      <Row className="p-2">
        <Col xs={12}>
          <div className="py-4">
            <h2>Previous Orders</h2>
          </div>
          <Row>
            <div className="col-12 col-sm-4 bg-body p-2">
              <select className="form-select" id="dayInWeek" name="dayInWeek">
                <option value="0">{weekday[0]}</option>
                <option value="1">{weekday[1]}</option>
                <option value="2">{weekday[2]}</option>
                <option value="3">{weekday[3]}</option>
                <option value="4">{weekday[4]}</option>
                <option value="5">{weekday[5]}</option>
                <option value="6">{weekday[6]}</option>
              </select>
              <Row>
                <Button className="mt-2" variant="primary" onClick={showPreviousSalesByProducts}>
                  Previous Order Quantities
                </Button>
              </Row>
            </div>
          </Row>
        </Col>

        <Row>
          <Col xs={12} sm={4}>
            <div className="py-4 clearfix">
              <h2>Show Preferences and Order Comments</h2>
            </div>
            <Row className="bg-body m-2 p-2">

              <Button variant="primary" onClick={() => { reportCustomerOrderPreferences(false); }}>
                Show Order Summary
              </Button>

              <Button variant="success" onClick={() => { reportCustomerOrderPreferences(true); }}>
                Download Order Summary &darr;
              </Button>

            </Row>
          </Col>
        </Row>

        <Row>

          <Col xs={12} sm={4}>
            <div className="py-4">
              <h2>User Report</h2>
            </div>
            <Row className="bg-body m-2 p-2">
              <Button variant="primary" onClick={() => { reportGetAllUsers(); }}>
                User Report
              </Button>
            </Row>
          </Col>
        </Row>

        <Row>
          <Col xs={12} sm={4}>
            <div className="py-4">
              <h2>General Reports</h2>
            </div>
            <Row className="bg-body m-2 p-2">
              <Button variant="primary" onClick={genDaysSummaryReport}>Days Summary</Button>
            </Row>
            <Row className="bg-body m-2 p-2">
              <Button variant="primary" href="/reconcileInventoryList">Inventory Reconciliation</Button>
            </Row>
          </Col>
        </Row>

        <Row>
          <Col xs={12} sm={4}>
            <div className="py-4">
              <h2 className="pull-left">Sales</h2>
              <Row className="bg-body m-2 p-2">
                <Button variant="primary" onClick={listInvoicesPerMonth}>Sales</Button>
              </Row>
            </div>
          </Col>
        </Row>

      </Row>
    </div>
  );
};

export default ReportsHome;

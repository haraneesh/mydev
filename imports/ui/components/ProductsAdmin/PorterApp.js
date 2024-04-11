import { Meteor } from 'meteor/meteor';
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { monthDayYearAtTimeFromEpoch } from '../../../modules/dates';
import constants from '../../../modules/constants';

function PorterApp({ order, user, passActionBack }) {
  const [porterQuote, setPorterQuote] = useState();

  const [porterOrderStatusDetails, setPorterOrderStatusDetails] = useState();

  const [porterOrderStatus, setPorterOrderStatus] = useState(order.porterOrderStatus
    ? order.porterOrderStatus
    : constants.PorterStatus.Not_Assigned.name);

  function getPorterOptions(orderId) {
    Meteor.call('porter.getQuote', orderId, (err, res) => {
      if (err) {
        toast.error(err.reason);
      } else {
        setPorterQuote(res);
      }
    });
  }

  function getPorterStatus(orderId) {
    Meteor.call('porter.getStatus', orderId, (err, res) => {
      if (err) {
        toast.error(err.reason);
      } else {
        setPorterOrderStatusDetails(res);
      }
    });
  }

  function createOrder(orderId) {
    Meteor.call('porter.createOrder', orderId, (err, res) => {
      if (err) {
        toast.error(err.reason);
      } else {
        toast.success('Order created successfully!');
        getPorterStatus(orderId);
        setPorterQuote(null);
        setPorterOrderStatus(constants.PorterStatus.live.name);
      }
    });
  }

  function cancelOrder(orderId) {
    if (confirm('Are you sure you want to cancel this order?')) {
      Meteor.call('porter.cancelOrder', orderId, (err, res) => {
        if (err) {
          toast.error(err.reason);
        } else {
          toast.success('Order cancelled successfully!');
          getPorterStatus(orderId);
          setPorterOrderStatus(constants.PorterStatus.cancelled.name);
        }
      });
    }
  }

  function convertEpochToTime(t) {
    if (t) {
      return monthDayYearAtTimeFromEpoch(t);
    }

    return '--';
  }

  function displayPartnerInfoDetails(partnerDetails) {
    /*   partner_info
json
Info. related to the partner
partner_info.name
string
Name registered with porter
partner_info.vehicle_number
string
Vehicle registration number
partner_info.vehicle_type
string
Vehicle type like two_wheeler or others
partner_info.mobile
json
Country_code, mobile_number
partner_info.partner_secondary_mobile
json
Country_code, mobile_number
partner_info.location
json
Current location of the partner. latitude and longitude values of the current location.
*/
    return (
      <div>
        {partnerDetails && (
        <div>
          <p>
            <b>Name:</b>
            <br />
            {partnerDetails.name}
          </p>
          <p>
            <b>Vehicle Number:</b>
            <br />
            {partnerDetails.vehicle_number}
          </p>
          <p>

            <b>Vehicle Type:</b>
            <br />
            {partnerDetails.vehicle_type}
          </p>
          <p>
            <b>Mobile Number:</b>
            <br />
            {(partnerDetails.mobile)
              ? `${partnerDetails.mobile.Country_code} ${partnerDetails.mobile.mobile_number}`
              : '--'}
          </p>
        </div>
        )}
      </div>
    );
  }

  function displayPorterOrderStatusDetails(d) {
    /*
    {
I20240407-11:17:37.361(5.5)?   order_id: 'CRN1712306565455',
I20240407-11:17:37.361(5.5)?   status: 'open',
I20240407-11:17:37.361(5.5)?   partner_info: null,
I20240407-11:17:37.361(5.5)?   order_timings: {
I20240407-11:17:37.361(5.5)?     pickup_time: 1651762986,
I20240407-11:17:37.361(5.5)?     order_accepted_time: null,
I20240407-11:17:37.361(5.5)?     order_started_time: null,
I20240407-11:17:37.361(5.5)?     order_ended_time: null
I20240407-11:17:37.361(5.5)?   },
I20240407-11:17:37.361(5.5)?   fare_details: {
I20240407-11:17:37.361(5.5)?     estimated_fare_details: { currency: 'INR', minor_amount: 68 },
I20240407-11:17:37.361(5.5)?     actual_fare_details: null
I20240407-11:17:37.361(5.5)?   }
I20240407-11:17:37.361(5.5)? }

    */
    return (
      <div>
        <p>
          <b>Order ID:</b>
          <br />
          {d.order_id}
        </p>
        <p>
          <b>Order Status:</b>
          <br />
          <div className={`badge bg-${constants.PorterStatus[porterOrderStatus].label}`}>
            {d.status}
          </div>
        </p>
        <Row className="align-items-start">
          <Col>
            <h7 className="text-uppercase">
              <b>Partner Info</b>
            </h7>
            <br className="mb-4" />
            {displayPartnerInfoDetails(d.partner_info)}
          </Col>
          <Col>
            <h7 className="text-uppercase"><b className="py-2">Order Timings</b></h7>
            <br className="mb-4" />
            <p>
              <b>Pickup Time:</b>
              <br />
              {convertEpochToTime(d.order_timings.pickup_time)}
            </p>
            <p>
              <b>Order Accepted Time:</b>
              <br />
              {convertEpochToTime(d.order_timings.order_accepted_time)}
            </p>
            <p>
              <b>Order Started Time:</b>
              <br />
              {convertEpochToTime(d.order_started_time)}
            </p>
            <p>
              <b>Order Ended Time:</b>
              <br />
              {convertEpochToTime(d.order_timings.order_ended_time)}
            </p>
          </Col>
          <Col>
            <h7 className="text-uppercase"><b>Fare Details</b></h7>
            <br className="mb-4" />
            <p>
              <b>Estimated Fare Details:</b>
              <br />
              {(d.fare_details)
                ? `Rs. ${d.fare_details.estimated_fare_details.minor_amount / 100}`
                : '--'}
            </p>
            <p>
              <b>Actual Fare Details:</b>
              <br />
              Rs.
              {(d.actual_fare_details)
                ? `Rs. ${d.actual_fare_details.minor_amount / 100}`
                : '--'}
            </p>
          </Col>
        </Row>
        {(constants.PorterStatus[porterOrderStatus].name !== constants.PorterStatus.cancelled.name)
        && (
        <Row>
          <Col>
            <Button variant="primary" onClick={() => cancelOrder(order.id)}>
              Cancel Order
            </Button>
          </Col>
        </Row>
        )}
      </div>

    );
  }

  function returnDisplay(quoteArray, porterId) {
    const vehicleRows = [];
    quoteArray.vehicles.forEach((element) => {
      const row = (
        <tr key={element.id}>
          <td>
            <Row>
              <Col xs={2}>
                <b>Vehicle Type :</b>
              </Col>
              <Col>
                {element.type}
              </Col>
              <Col xs={1}>
                <b>Capacity :</b>
              </Col>
              <Col xs={1}>
                {element.capacity.value}
                {' '}
                {element.capacity.unit}
              </Col>
              <Col xs={1}>
                <b>Fare :</b>
              </Col>
              <Col xs={2}>
                Rs.
                {' '}
                {element.fare.minor_amount / 100}
              </Col>
              <Col xs={2}>
                {(element.type.toLowerCase() === '2 wheeler')
                  ? (<Button variant="info" onClick={() => { createOrder(porterId); }}>Book</Button>)
                  : ' '}
              </Col>
            </Row>
          </td>
        </tr>

      );
      vehicleRows.push(row);
    });

    return vehicleRows;
  }
  function handleClose() {
    passActionBack({ action: 'cancel' });
  }

  function showPlaceOrder() {
    return (
      <Row>
        <Col>
          <br />
          <Button variant="primary" onClick={() => getPorterOptions(order.id)}>
            Get Porter Order Options
          </Button>
        </Col>
      </Row>
    );
  }

  function showGetStatus() {
    return (
      <Row>
        <Col>
          <br />
          <Button variant="primary" onClick={() => getPorterStatus(order.id)}>
            Get Porter Order Status
          </Button>
        </Col>
      </Row>
    );
  }

  return (
    <Modal show className="modalPorterApp" size="xl" fullscreen="sm-down" animation onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          Rent Porter
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row>

          <p
            className={`badge text-left fs-5 rounded-2 p-2 bg-${constants.PorterStatus[porterOrderStatus].label}`}
          >
            {constants.PorterStatus[porterOrderStatus].display_value}
          </p>

          <Col>
            <p><b>Suvai Location :</b></p>
            Latitude:
            {' '}
            {Meteor.settings.public.suvaiLocation.latitude}
            <br />
            Longitude:
            {' '}
            {Meteor.settings.public.suvaiLocation.longitude}
          </Col>
          <Col>
            <p><b>Drop Location :</b></p>
            Latitude:
            {' '}
            {user.profile.deliveryAddressLatitude}
            <br />
            Longitude:
            {' '}
            {user.profile.deliveryAddressLongitude}
          </Col>
        </Row>
        {(constants.PorterStatus[porterOrderStatus].name !== 'live') && showPlaceOrder()}
        {(constants.PorterStatus[porterOrderStatus].name === 'live') && showGetStatus()}

      </Modal.Body>

      <Modal.Footer>
        <table className="table table-striped">
          <tbody>
            {(porterQuote && constants.PorterStatus[porterOrderStatus].name !== 'live') && returnDisplay(porterQuote, order.id)}
            {(porterOrderStatusDetails)
            && displayPorterOrderStatusDetails(porterOrderStatusDetails)}
          </tbody>
        </table>
      </Modal.Footer>
    </Modal>

  );
}

PorterApp.propTypes = {
  order: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  passActionBack: PropTypes.func.isRequired,
};

export default PorterApp;

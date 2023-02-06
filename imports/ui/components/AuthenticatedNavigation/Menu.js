// import React, { Component } from 'react';
import React from 'react';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import PropTypes from 'prop-types';

const Menu = (props) => (
  <>
    <div className="text-end col-3 col-sm-2">

      <Button
        variant="white"
        onClick={() => { props.history.push('/profile'); }}
        className="px-2 px-sm-3"
        id="profileIcon"
      >
        <span className="material-icons fs-2">person</span>
      </Button>

      <Button
        variant="white"
        onClick={props.handleShow}
        className="px-2 px-sm-3"
        id="menuIcon"
      >
        <span className="material-icons fs-2"> menu </span>
      </Button>

      <Offcanvas show={props.show} onHide={props.handleClose} placement="top" name="OffCanvasMenu">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <h3> Namma Suvai </h3>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Row className="px-sm-4">
            {props.children}
          </Row>
        </Offcanvas.Body>
      </Offcanvas>

    </div>

  </>
);

export default Menu;

Menu.propTypes = {
  children: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

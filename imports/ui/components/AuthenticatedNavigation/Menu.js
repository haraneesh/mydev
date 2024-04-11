// import React, { Component } from 'react';
import React from 'react';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import PropTypes from 'prop-types';
import Icon from '../Icon/Icon';

import { useCartState } from '../../stores/ShoppingCart';

const Menu = (props) => {
  const cartState = useCartState();
  const totalProductsInCount = cartState.newCartCountOfItems;

  return (
    <>
      <div className="text-end col-5 col-sm-2">

        <Button
          variant="white"
          onClick={() => { props.history.push('/profile'); }}
          className="px-2"
          id="profileIcon"
        >
          <Icon icon="person" className="fs-2 icon-fill" type="mt" />
        </Button>
        <Button
          variant="white"
          onClick={() => {
            if (totalProductsInCount > 0) {
              props.history.push('/cart');
            } else {
              props.history.push('/neworder');
            }
          }}
          className="px-2"
          id="menuCartIcon"
        >
          <Icon icon="local_mall" className="fs-2 icon-fill" type="mt" />
          {(totalProductsInCount > 0) && (
            <b className="alertMenu shoppingCartBubble">
              {totalProductsInCount}
            </b>
          )}
        </Button>

        <Button
          variant="white"
          onClick={props.handleShow}
          className="px-2 px-sm-3"
          id="menuIcon"
        >
          <Icon icon="menu" className="fs-2" type="mt" />
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
};

export default Menu;

Menu.propTypes = {
  children: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

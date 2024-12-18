import PropTypes from 'prop-types';
// import React, { Component } from 'react';
import React from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Row from 'react-bootstrap/Row';
import Icon from '../Icon/Icon';

import { useNavigate } from 'react-router-dom';
import { useCartState } from '../../stores/ShoppingCart';

const Menu = (props) => {
  const cartState = useCartState();
  const navigate = useNavigate();
  const totalProductsInCount = cartState.newCartCountOfItems;

  return (
    <>
      <div className="text-end col">
        <Button
          variant="white"
          onClick={() => {
            navigate('/profile');
          }}
          className="px-2"
          id="profileIcon"
        >
          <Icon icon="person" className="fs-2 icon-fill" type="mt" />
        </Button>
        <Button
          variant="white"
          onClick={() => {
            if (totalProductsInCount > 0) {
              navigate('/cart');
            } else {
              navigate('/neworder');
            }
          }}
          className="px-2"
          id="menuCartIcon"
        >
          <Icon icon="local_mall" className="fs-2 icon-fill" type="mt" />
          {totalProductsInCount > 0 && (
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

        <Offcanvas
          show={props.show}
          onHide={props.handleClose}
          placement="top"
          name="OffCanvasMenu"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              <h3> Namma Suvai </h3>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Row className="px-sm-4">{props.children}</Row>
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </>
  );
};

export default Menu;

Menu.propTypes = {
  children: PropTypes.array.isRequired,
};

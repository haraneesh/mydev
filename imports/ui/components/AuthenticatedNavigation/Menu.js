import React, { Component } from 'react';
import { Button, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Bert } from 'meteor/themeteorchef:bert';

const shoppingCartBubble = {
  background: '#EF0905',
  borderRadius: '50%',
  fontSize: '11px',
  position: 'relative',
  boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
  left: '8px',
  top: '-42px',
  color: '#fff',
  minWidth: '2.5em',
  lineHeight: '2.2em',
  border: '2px solid #fff',
  textAlign: 'center',
  display: 'block',
};

const cartMenu = () => (
  <div className="dropdown">
    <button className="btn btn-default dropdown-toggle btn-link" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
      Dropdown
    </button>
    <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
      <li><a href="#">Action</a></li>
      <li><a href="#">Another action</a></li>
      <li><a href="#">Something else here</a></li>
      <li role="separator" className="divider" />
      <li><a href="#">Separated link</a></li>
    </ul>
  </div>
);

export default class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  onCartIconClick(history, totalProductsInCount) {
    if (totalProductsInCount > 0) {
      history.push('/cart');
    } else {
      Bert.alert('Cart is empty', 'info');
    }
  }

  hide() {
    document.removeEventListener('click', this.hide);
    this.setState({ visible: false });
  }

  show() {
    this.setState({ visible: true });
    document.addEventListener('click', this.hide);
  }

  render() {
    const menuVisible = this.state.visible ? 'visible ' : '';
    const totalProductsInCount = this.props.cartState.newCartCountOfItems;

    return (
      <Row className="pull-right">
        {<span id="cartIcon" style={{ marginTop: '16px', float: 'left', fontSize: '1.25em', display: 'block' }}>
          <a onClick={() => { this.onCartIconClick(this.props.history, totalProductsInCount); }}> <i className="fas fa-shopping-bag" style={{ color: '#522E23' }} />
            {(totalProductsInCount > 0) && (<b style={shoppingCartBubble} className="alertMenu"> {totalProductsInCount} </b>)}
          </a>
        </span>}
        <div className="menu-expand-button">
          <Button type="button" bsStyle="link" className={''} onClick={this.show}>
            <span className={`icon-bar top-bar ${menuVisible}`} />
            <span className={`icon-bar middle-bar ${menuVisible}`} />
            <span className={`icon-bar bottom-bar ${menuVisible}`} />
          </Button>
        </div>
        <div className="menu">
          <div className={menuVisible + this.props.alignment} style={{ zIndex: 1100 }}>
            {this.props.children}
          </div>
        </div>
      </Row>
    );
  }
}

Menu.propTypes = {
  alignment: PropTypes.string.isRequired,
  children: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  cartState: PropTypes.object.isRequired,
};

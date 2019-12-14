import React, { Component } from 'react';
import { Button, Row, Glyphicon } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { getFromLocalStore, StoreConstants } from '../../../modules/client/store';
import { Session } from 'meteor/session';
import { withTracker } from 'meteor/react-meteor-data';

const shoppingCartBubble = {
  background: '#54ae68',
  borderRadius: '100%',
  fontSize: '11px',
  lineHeight: '1',
  padding: '5px 5px',
  position: 'absolute',
  right: '-5px',
  top: '-3px',
};

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  show() {
    this.setState({ visible: true });
    document.addEventListener('click', this.hide);
  }

  hide() {
    document.removeEventListener('click', this.hide);
    this.setState({ visible: false });
  }

  render() {
    const menuVisible = this.state.visible ? 'visible ' : '';
    return (
      <Row className="pull-right">
        {<span id="cartIcon" style={{ marginTop: '14px', float: 'left', fontSize: '1.5em', display: this.props.shoppingCartIcon ? 'block' : 'none' }}>
          <a href="/order/checkout"> <Glyphicon glyph="shopping-cart" className="alertMenu" /> {/* <b style={shoppingCartBubble} /> */} </a>
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

Menu.defaultProps = {
  shoppingCartIcon: false,
};

Menu.propTypes = {
  alignment: PropTypes.string.isRequired,
  children: PropTypes.object.isRequired,
  shoppingCartIcon: PropTypes.bool,
};

Session.set(StoreConstants.CARTICON, !!getFromLocalStore(StoreConstants.CART));

export default (withTracker(() => {
  const shoppingCartIcon = Session.get(StoreConstants.CARTICON);

  return { shoppingCartIcon };
})(Menu));

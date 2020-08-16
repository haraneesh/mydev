// import React, { Component } from 'react';
import React, { useState, useEffect } from 'react';
import { Button, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';

/* export default class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  } */

const Menu = (props) => {
  const [isMenuVisible, setMenuVisibility] = useState(false);

  useEffect(() => {
    setMenuVisibility(false);
  }, []);

  const hide = () => {
    setMenuVisibility(false);
    document.removeEventListener('click', hide);
  };

  const show = () => {
    if (!isMenuVisible) {
      document.addEventListener('click', hide);
    }
    setMenuVisibility(true);
  };

  const menuVisible = isMenuVisible ? 'visible' : ''; // this.state.visible ? 'visible ' : '';

  return (
    <Row className="pull-right">
      <span
        id="profileIcon"
        style={{
          marginTop: '18px', marginRight: '15px', float: 'left', fontSize: '1.25em', display: 'block',
        }}
      >
        <a onClick={() => { props.history.push('/profile'); }} href="#">
          <i className="fas fa-user" style={{ color: '#522E23' }} />
        </a>
      </span>
      <div className="menu-expand-button">
        <Button type="button" bsStyle="link" className="" onClick={show}>
          <span className={`icon-bar top-bar ${menuVisible}`} />
          <span className={`icon-bar middle-bar ${menuVisible}`} />
          <span className={`icon-bar bottom-bar ${menuVisible}`} />
        </Button>
      </div>
      <div className="menu" style={{ display: (isMenuVisible) ? 'block' : 'none' }}>
        <div className={menuVisible + props.alignment} style={{ zIndex: 1100 }}>
          {props.children}
        </div>
      </div>
    </Row>
  );
};

export default Menu;

Menu.propTypes = {
  alignment: PropTypes.string.isRequired,
  children: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

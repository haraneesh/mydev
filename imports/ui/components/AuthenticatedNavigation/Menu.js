import React, { Component } from 'react';
import { Button, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';

export default class Menu extends Component {
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
        <div className="menu-expand-button">
          <Button type="button" bsStyle="link" className={''} onClick={this.show}>
            <span className={`icon-bar top-bar ${menuVisible}`} />
            <span className={`icon-bar middle-bar ${menuVisible}`} />
            <span className={`icon-bar bottom-bar ${menuVisible}`} />
          </Button>
        </div>
        <div className="menu">
          <div className={menuVisible + this.props.alignment} style={{zIndex:1100}}>
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
};

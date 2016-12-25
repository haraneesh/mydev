import React from 'react';
import { browserHistory } from 'react-router';
import { IndexLinkContainer, LinkContainer } from 'react-router-bootstrap';
import { Nav, NavItem, NavDropdown, MenuItem, Glyphicon, Badge } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';

const handleLogout = () => Meteor.logout(() => browserHistory.push('/login'));

const userName = () => {
  const user = Meteor.user();
  const name = user && user.profile ? user.profile.name : '';
  return user ? `${name.first} ${name.last}` : '';
};

const AuthenticatedNavigation = () => (
  <div>
    <Nav>
      <LinkContainer to="/documents">
        <NavItem eventKey={ 2 } href="/documents">Documents</NavItem>
      </LinkContainer>
      <IndexLinkContainer to="/">
          <NavItem eventKey={ 4 } href="/"> <Glyphicon glyph="th-list" /> My Orders</NavItem>
      </IndexLinkContainer>
      <LinkContainer to="/order">
        <NavItem eventKey={ 5 } href="/order"> <Glyphicon glyph="plus" /> Place my Order</NavItem>
      </LinkContainer>
      
      <NavDropdown eventKey={ 6 } title="Admin" id="admin-nav-dropdown">
        <LinkContainer to="/admin/products">
          <MenuItem eventKey={ 6.1 }>Admin Products</MenuItem>
        </LinkContainer>
        <MenuItem divider />
        <LinkContainer to="/productLists">
         <MenuItem eventKey={ 6.1 }>View All ProductLists</MenuItem>
        </LinkContainer>
      </NavDropdown>

    </Nav>
    <Nav pullRight>
      <NavDropdown eventKey={ 7 } title={ userName() } id="basic-nav-dropdown">
        <MenuItem eventKey={ 7.1 } onClick={ handleLogout }>Logout</MenuItem>
      </NavDropdown>
    </Nav>
  </div>
);

export default AuthenticatedNavigation;

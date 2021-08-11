import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

const AdminNav = (props) => {
  // const user = Meteor.user();
  if (props.isAdmin) {
    return (
      <div>
        <div className="menu-header"> Admin </div>
        <ul>
          <li>
            <NavLink to="/products">Manage Products</NavLink>
          </li>
          <li>
            <NavLink to="/productLists">Manage ProductLists</NavLink>
          </li>
          <li>
            <NavLink to="/allorders"> Manage Orders</NavLink>
          </li>
          <li>
            <NavLink to="/messagesadmin"> Manage Messages</NavLink>
          </li>
          <li>
            <NavLink to="/recipes">Manage Recipes</NavLink>
          </li>
          <li>
            <NavLink to="/suppliers">Manage Suppliers</NavLink>
          </li>
          {/* <li>
            <NavLink to="/baskets"> Manage Baskets</NavLink>
          </li>
         */}
          <li>
            <NavLink to="/specials/edit">Manage Specials</NavLink>
          </li>
          <li>
            <NavLink to="/approveSignUps"> Approve Sign Ups</NavLink>
          </li>
          <li>
            <NavLink to="/reports">View Reports</NavLink>
          </li>
          <li>
            <NavLink to="/updateProfile">Create / Update User</NavLink>
          </li>
          <br />
          <li>
            <NavLink to="/zohoSync">Zoho Sync</NavLink>
          </li>
          <li>
            <NavLink to="/zohoUpdateReturnables">Zoho Update Returnables </NavLink>
          </li>
        </ul>
      </div>
    );
  }
  return null;
};

export default AdminNav;

AdminNav.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
};

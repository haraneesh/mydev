import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import constants from '../../../modules/constants';

const AdminNav = (props) => {
  // const user = Meteor.user();
  if (props.roles.includes(constants.Roles.admin.name)) {
    return (
      <div>
        <div className="menu-header"> Admin </div>
        <ul>
          <li>
            <NavLink to="/admin/products">Manage Products</NavLink>
          </li>
          <li>
            <NavLink to="/productLists">Manage ProductLists</NavLink>
          </li>
          <li>
            <NavLink to="/allorders"> Manage Orders</NavLink>
          </li>
          <li>
            <NavLink to="/recipes">Recipes</NavLink>
          </li>
          <li>
            <NavLink to="/specials/edit">Manage Specials</NavLink>
          </li>
          <li>
            <NavLink to="/updateProfile">Create / Update User</NavLink>
          </li>
          <li>
            <NavLink to="/admin/zohoSync">Zoho Sync</NavLink>
          </li>
        </ul>
      </div>
    );
  }
  return null;
};

export default AdminNav;

AdminNav.propTypes = {
  roles: PropTypes.array.isRequired,
};

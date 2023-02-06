import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

const AdminNav = (props) => {
  // const user = Meteor.user();
  const { isAdmin } = props;
  if (isAdmin) {
    return (
      <div>
        <div className="small mb-3"> ADMIN </div>
        <ul style={{ listStyle: 'none' }} className="p-0">
          <li>
            <NavLink to="/products" onClick={props.handleClose}>Manage Products</NavLink>
          </li>
          <li>
            <NavLink to="/productLists" onClick={props.handleClose}>Manage ProductLists</NavLink>
          </li>
          <li>
            <NavLink to="/allorders" onClick={props.handleClose}> Manage Orders</NavLink>
          </li>
          <li>
            <NavLink to="/messagesadmin" onClick={props.handleClose}> Manage Messages</NavLink>
          </li>
          <li>
            <NavLink to="/recipes" onClick={props.handleClose}>Manage Recipes</NavLink>
          </li>
          <li>
            <NavLink to="/suppliers" onClick={props.handleClose}>Manage Suppliers</NavLink>
          </li>
          {/* <li>
            <NavLink to="/baskets"> Manage Baskets</NavLink>
          </li>
         */}
          <li>
            <NavLink to="/specials/edit" onClick={props.handleClose}>Manage Specials</NavLink>
          </li>
          <br />
          <li>
            <NavLink to="/allusers" onClick={props.handleClose}> All Users </NavLink>
          </li>
          <li>
            <NavLink to="/approvesignups" onClick={props.handleClose}> Approve Sign Ups</NavLink>
          </li>
          <li>
            <NavLink to="/updateProfile" onClick={props.handleClose}>Create / Update User</NavLink>
          </li>
          <br />
          <li>
            <NavLink to="/reports" onClick={props.handleClose}>View Reports</NavLink>
          </li>
          <li>
            <NavLink to="/zohoSync" onClick={props.handleClose}>Zoho Sync</NavLink>
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
  handleClose: PropTypes.func.isRequired,
};

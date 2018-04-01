import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table, Alert, Button, Panel } from 'react-bootstrap';
//import { timeago, monthDayYearAtTime } from '@cleverbeagle/dates';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Bert } from 'meteor/themeteorchef:bert';
import SuppliersCollection from '../../../../api/Suppliers/Suppliers';
import Loading from '../../../components/Loading/Loading';

import './Suppliers.scss';

const handleRemove = (supplierId) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('suppliers.remove', supplierId, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Supplier deleted!', 'success');
      }
    });
  }
};

const Suppliers = ({ loading, suppliers, match, history }) => (!loading ? (
  <div className="Suppliers">
    <div className="page-header clearfix">
      <h3 className="pull-left">Suppliers</h3>
      <Link className="btn btn-primary pull-right" to={`${match.url}/new`}>Add Supplier</Link>
    </div>
    {suppliers.length ? <Panel> <Table responsive>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {suppliers.map(({ _id, name, description }) => (
          <tr key={_id}>
            <td>{name}</td>
            <td>{description}</td>
            <td>
              <Button
                bsStyle="primary"
                onClick={() => history.push(`${match.url}/${_id}`)}
                block
              >View</Button>
            </td>
            <td>
              <Button
                bsStyle="info"
                onClick={() => handleRemove(_id)}
                block
              >Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table> </Panel> : <Alert bsStyle="info">No suppliers yet!</Alert>}
  </div>
) : <Loading />);

Suppliers.propTypes = {
  loading: PropTypes.bool.isRequired,
  suppliers: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('suppliers');
  return {
    loading: !subscription.ready(),
    suppliers: SuppliersCollection.find().fetch(),
  };
}, Suppliers);

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Table, Alert, Button, Panel,
} from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { toast } from 'react-toastify';
import SuppliersCollection from '../../../../../api/Suppliers/Suppliers';
import Loading from '../../../../components/Loading/Loading';

import './Suppliers.scss';

const handleRemove = (supplierId) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('suppliers.remove', supplierId, (error) => {
      if (error) {
        toast.error(error.reason);
      } else {
        toast.success('Supplier deleted!');
      }
    });
  }
};

const Suppliers = ({
  loading, suppliers, match, history,
}) => (!loading ? (
  <div className="Suppliers">
    <div className="page-header clearfix">
      <h2 className="pull-left">Suppliers</h2>
      <Link className="btn btn-primary pull-right" to={`${match.url}/new`}>Add Supplier</Link>
    </div>
    {suppliers.length ? (
      <Panel>
        {' '}
        <Table responsive>
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
                  >
                    View
                  </Button>
                </td>
                <td>
                  <Button
                    bsStyle="info"
                    onClick={() => handleRemove(_id)}
                    block
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {' '}

      </Panel>
    ) : <Alert bsStyle="info">No suppliers yet!</Alert>}
  </div>
) : <Loading />);

Suppliers.propTypes = {
  loading: PropTypes.bool.isRequired,
  suppliers: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('suppliers');
  return {
    loading: !subscription.ready(),
    suppliers: SuppliersCollection.find().fetch(),
  };
})(Suppliers);

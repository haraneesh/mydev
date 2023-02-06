import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';

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
    <div className="py-4 clearfix">
      <h2 className="pull-left">Suppliers</h2>
      <Link className="btn btn-primary pull-right" to={`${match.url}/new`}>Add Supplier</Link>
    </div>
    {suppliers.length ? (
      <Row className="bg-body">
        <Table striped bordered responsive>
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
                    variant="secondary"
                    onClick={() => history.push(`${match.url}/${_id}`)}
                    className="btn-block"
                  >
                    View
                  </Button>
                </td>
                <td>
                  <Button
                    variant="info"
                    onClick={() => handleRemove(_id)}
                    className="btn-block"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {' '}

      </Row>
    ) : <Alert variant="info">No suppliers yet!</Alert>}
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

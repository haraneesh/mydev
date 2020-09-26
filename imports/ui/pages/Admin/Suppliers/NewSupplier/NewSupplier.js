import React from 'react';
import PropTypes from 'prop-types';
import SupplierEditor from '../../../../components/SupplierEditor/SupplierEditor';

const NewSupplier = ({ history }) => (
  <div className="NewSupplier">
    <h3 className="page-header">New Supplier</h3>
    <SupplierEditor history={history} />
  </div>
);

NewSupplier.propTypes = {
  history: PropTypes.object.isRequired,
};

export default NewSupplier;

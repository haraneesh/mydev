import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Suppliers from '../../../../../api/Suppliers/Suppliers';
import SupplierEditor from '../../../../components/SupplierEditor/SupplierEditor';
import NotFound from '../../../Miscellaneous/NotFound/NotFound';
import Loading from '../../../../components/Loading/Loading';

const EditSupplier = ({ supp, loading, history }) => {
  if (loading) {
    return (<Loading />);
  }

  return (supp ? (
    <div className="EditSupplier">
      <h3 className="page-header">{`Editing "${supp.name}"`}</h3>
      <SupplierEditor supp={supp} history={history} />
    </div>
  ) : <NotFound />);
};

EditSupplier.propTypes = {
  supp: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  loading: PropTypes.object.isRequired,
};

export default withTracker(({ match }) => {
  const supplierId = match.params._id;
  const subscription = Meteor.subscribe('suppliers.view', supplierId);

  return {
    loading: !subscription.ready(),
    supp: Suppliers.findOne(supplierId),
  };
}) (EditSupplier);

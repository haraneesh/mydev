import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';
import Suppliers from '../../../../../api/Suppliers/Suppliers';
import NotFound from '../../../Miscellaneous/NotFound/NotFound';
import Loading from '../../../../components/Loading/Loading';

const handleRemove = (supplierId, history) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('suppliers.remove', supplierId, (error) => {
      if (error) {
        toast.error(error.reason);
      } else {
        toast.success('Supplier deleted!');
        history.push('/suppliers');
      }
    });
  }
};

const renderSupplier = (supp, match, history) => (supp ? (
  <div className="ViewSupplier">
    <div className="py-4 clearfix">
      <h3 className="pull-left">{supp && supp.name}</h3>
      <Row className="pull-right">

        <Button size="sm" onClick={() => history.push(`${match.url}/edit`)}>Edit</Button>
        <Button size="sm" onClick={() => handleRemove(supp._id, history)} className="text-danger">
          Delete
        </Button>

      </Row>
    </div>

    <section className="card">
      <div className="card-body">
        <div className="col-6">
          Margin:
        </div>
        <div className="col-6">
          {supp && supp.marginPercentage}
          {' '}
          %
        </div>
      </div>
    </section>
    <section className="card">
      <div className="card-body">
        <div className="col-6">
          Zoho Auth Token:
        </div>
        <div className="col-6">
          {supp && supp.zohoAuthtoken}
        </div>
      </div>
    </section>
    <section className="card">
      <div className="card-body">
        <div className="col-6">
          Zoho Organization Id:
        </div>
        <div className="col-6">
          {supp && supp.zohoOrganizationId}
        </div>
      </div>
    </section>

    <section className="card">
      <div className="card-body">
        <div className="col-12">
          Description:
          {' '}
          <br />
          {supp && supp.description}
        </div>
      </div>
    </section>

  </div>
) : <NotFound />);

const ViewSupplier = ({
  loading, supp, match, history,
}) => (
  !loading ? renderSupplier(supp, match, history) : <Loading />
);

ViewSupplier.propTypes = {
  loading: PropTypes.bool.isRequired,
  supp: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker(({ match }) => {
  const supplierId = match.params._id;
  const subscription = Meteor.subscribe('suppliers.view', supplierId);

  return {
    loading: !subscription.ready(),
    supp: Suppliers.findOne(supplierId) || {},
  };
})(ViewSupplier);

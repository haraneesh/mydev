import React from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar, ButtonGroup, Button } from 'react-bootstrap';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import Suppliers from '../../../../../api/Suppliers/Suppliers';
import NotFound from '../../../Miscellaneous/NotFound/NotFound';
import Loading from '../../../../components/Loading/Loading';

const handleRemove = (supplierId, history) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('suppliers.remove', supplierId, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Supplier deleted!', 'success');
        history.push('/suppliers');
      }
    });
  }
};

const renderSupplier = (supp, match, history) => (supp ? (
  <div className="ViewSupplier">
    <div className="page-header clearfix">
      <h3 className="pull-left">{supp && supp.name}</h3>
      <ButtonToolbar className="pull-right">
        <ButtonGroup bsSize="small">
          <Button onClick={() => history.push(`${match.url}/edit`)}>Edit</Button>
          <Button onClick={() => handleRemove(supp._id, history)} className="text-danger">
            Delete
          </Button>
        </ButtonGroup>
      </ButtonToolbar>
    </div>

    <section className="panel panel-default">
      <div className="panel-body">
        <div className="col-xs-6">
          Margin:
        </div>
        <div className="col-xs-6">
          {supp && supp.marginPercentage}
          {' '}
          %
        </div>
      </div>
    </section>
    <section className="panel panel-default">
      <div className="panel-body">
        <div className="col-xs-6">
          Zoho Auth Token:
        </div>
        <div className="col-xs-6">
          {supp && supp.zohoAuthtoken}
        </div>
      </div>
    </section>
    <section className="panel panel-default">
      <div className="panel-body">
        <div className="col-xs-6">
          Zoho Organization Id:
        </div>
        <div className="col-xs-6">
          {supp && supp.zohoOrganizationId}
        </div>
      </div>
    </section>

    <section className="panel panel-default">
      <div className="panel-body">
        <div className="col-xs-12">
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

export default createContainer(({ match }) => {
  const supplierId = match.params._id;
  const subscription = Meteor.subscribe('suppliers.view', supplierId);

  return {
    loading: !subscription.ready(),
    supp: Suppliers.findOne(supplierId) || {},
  };
}, ViewSupplier);

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Row, Col, Alert, Button, Panel,
} from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { toast } from 'react-toastify';
import BasketsCollection from '../../../api/Baskets/Baskets';
import Loading from '../../components/Loading/Loading';

const handleRemove = (basketId) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('baskets.remove', basketId, (error) => {
      if (error) {
        toast.error(error.reason);
      } else {
        toast.success('Basket deleted!');
      }
    });
  }
};

const Baskets = ({
  loading, baskets, match, history,
}) => (!loading ? (
  <div className="Baskets">
    <div className="page-header clearfix">
      <h3 className="text-center">Baskets</h3>
    </div>
    <section className="panel panel-body text-center">
      <Col xs={12}>
        {/* <p> You can prefill your order from Baskets you are creating.</p> */}
        <p> Basket is a list of your favorite products.</p>
        <p> Next time you order, you can save time, by choosing to prefill your cart from Basket you are creating.</p>
        {/* <p> Next time you order, you can select a basket to prefill your cart and save time.</p> */}
      </Col>
      <Link className="btn btn-primary" to={`${match.url}/new`}>Create New Basket</Link>
    </section>

    {baskets.length ? (
      <Panel>
        {baskets.map(({ _id, name, description }) => (
          <Row className="panel-body" key={`${name}`}>
            <Col xs={12} sm={4} style={{ marginBottom: '3px' }}>{name}</Col>
            <Col xs={12} sm={5} className="text-muted" style={{ marginBottom: '3px' }}>{description}</Col>
            <Col xs={12} sm={3} className="text-right" style={{ marginBottom: '3px' }}>
              <Button
                className="btn-sm"
                style={{ marginRight: '2px' }}
                bsStyle="info"
                onClick={() => history.push(`/baskets/${_id}`)}
              >
                View
              </Button>
              <Button
                className="btn-sm"
                bsStyle="default"
                onClick={() => handleRemove(_id)}
              >
                Delete
              </Button>
            </Col>
          </Row>
        ))}
      </Panel>
    ) : <Alert bsStyle="info">No baskets yet!</Alert>}
  </div>
) : <Loading />);

Baskets.propTypes = {
  loading: PropTypes.bool.isRequired,
  baskets: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('baskets');
  return {
    loading: !subscription.ready(),
    baskets: BasketsCollection.find().fetch(),
  };
})(Baskets);

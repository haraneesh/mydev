import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
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
    <div className="py-4 clearfix">
      <h2 className="text-center">Baskets</h2>
    </div>
    <section className="card card-body text-center">
      <Col xs={12}>
        {/* <p> You can prefill your order from Baskets you are creating.</p> */}
        <p> Basket is a list of your favorite products.</p>
        <p> Next time you order, you can save time, by choosing to prefill your cart from Basket you are creating.</p>
        {/* <p> Next time you order, you can select a basket to prefill your cart and save time.</p> */}
      </Col>
      <Link className="btn btn-primary" to={`${match.url}/new`}>Create New Basket</Link>
    </section>

    {baskets.length ? (
      <Row className="p-2 m-2 bg-body">
        {baskets.map(({ _id, name, description }) => (
          <Row className="card-body" key={`${name}`}>
            <Col xs={12} sm={4} className="mb-3">{name}</Col>
            <Col xs={12} sm={5} className="text-muted mb-3">{description}</Col>
            <Col xs={12} sm={3} className="text-right mb-3">
              <Button
                size="sm"
                variant="info"
                onClick={() => history.push(`/baskets/${_id}`)}
              >
                View
              </Button>
              <Button
                size="sm"
                onClick={() => handleRemove(_id)}
              >
                Delete
              </Button>
            </Col>
          </Row>
        ))}
      </Row>
    ) : <Alert variant="info">No baskets yet!</Alert>}
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

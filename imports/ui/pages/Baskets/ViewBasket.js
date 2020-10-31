import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { ButtonToolbar, ButtonGroup, Button, Row, Col } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';
import Products from '../../../api/Products/Products';
import { createProductHash } from '../../components/Baskets/BasketCommon';
import { displayUnitOfSale } from '../../../modules/helpers';
import Loading from '../../components/Loading/Loading';

const handleRemove = (basketId, history) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('baskets.remove', basketId, (error) => {
      if (error) {
        toast.error(error.reason);
      } else {
        toast.success('Basket deleted!');
        history.push('/baskets');
      }
    });
  }
};

const renderBasket = ({ products, basketId, history }) => {
  const [isBasketLoading, setIsBasketLoading] = useState(true);
  const [basket, setBasket] = useState([]);
  const productHash = createProductHash(products);

  useEffect(() => {
    if (basketId) {
      Meteor.call('baskets.getOne', basketId,
        (error, existingBasket) => {
          if (error) {
            toast.error(error.reason);
          } else {
            setBasket(existingBasket);
            setIsBasketLoading(false);
          }
        });
    } else {
      setIsBasketLoading(false);
    }
  }, []);

  return (!isBasketLoading ? (
    <div className="ViewBasket">
      <div className="page-header clearfix">
        <h3 className="text-center">{basket && basket.name}</h3>
      </div>

      <section className="panel panel-default">
        <div className="panel-body">
          <div className="col-xs-12 text-right">
            <Button style={{ marginRight: '2px' }} bsStyle="info" className="btn-sm" onClick={() => history.push(`${history.location.pathname}/edit`)}>Edit</Button>
            <Button onClick={() => handleRemove(basket._id, history)} bsStyle="default" className="btn-sm">
              Delete
            </Button>
          </div>
        </div>

        <div className="panel-body">
          <div className="col-xs-4">
            <b style={{ marginBottom: '3px' }}> Description: </b>
          </div>
          <div className="col-xs-8">
            {basket && basket.description}
          </div>
        </div>

        <div className="panel-body">
          <div className="col-xs-12">
            <b style={{ marginBottom: '3px' }}> Products:</b>
            {basket && basket.products && basket.products.map(product => (
              <Row key={product._id} style={{ paddingBottom: '4px' }}>
                <Col xs={9}>{productHash[product._id].name}</Col>
                <Col xs={3}>{displayUnitOfSale(product.quantity, productHash[product._id].unitOfSale)}</Col>
              </Row>
            ))}

          </div>
        </div>
      </section>


    </div>
  ) : <Loading />);
};

const ViewBasket = args => (
  !args.loading ? renderBasket({ ...args }) : <Loading />
);

ViewBasket.propTypes = {
  loading: PropTypes.bool.isRequired,
  basketId: PropTypes.string.isRequired,
  products: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  loggedInUser: PropTypes.object,
};

export default withTracker(({ match, loggedInUser, history }) => {
  const prdSubscription = Meteor.subscribe('products.list');
  const products = Products.find().fetch();

  return {
    loading: !prdSubscription.ready(),
    products,
    basketId: match.params._id,
    history,
    loggedInUser,
  };
})(ViewBasket);

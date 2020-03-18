import { Meteor } from 'meteor/meteor';
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import constants from '../../../modules/constants';
import { ListProducts } from './BasketCommon';

const createProductHash = (productArray) => {
  const productsHash = {};
  productArray.forEach(product => {
    productsHash[product._id] = product;
  });
  return productsHash;
}

const createProductArrayFromHash = (productsHash) => {
  const productArray = [];
  Object.keys(productsHash).map((key) => {
    const product = productsHash[key];
    productArray.push({ _id: product._id, quantity: product.quantity })
  })
  return productArray;
}

const getSplitProductsHash = (productsHash) => {
  const selectedProductsHash = { count: 0, products: {} };
  const deletedProductsHash = { count: 0, products: {} };
  Object.keys(productsHash).map((key, index) => {
    const product = productsHash[key];
    if (product.quantity > 0) {
      selectedProductsHash.count += 1;
      selectedProductsHash.products[product._id] = product;
    }
    else {
      deletedProductsHash.count += 1;
      deletedProductsHash.products[product._id] = product;
    }
  });

  return {
    selectedProductsHash,
    deletedProductsHash
  }
}

const BasketEditor = ({ history, basketDetails, loggedInUser }) => {
  const refName = useRef();
  const [productsHashInBasket, setProductsHashBasketDetails] = useState(createProductHash(basketDetails.products));
  const { selectedProductsHash, deletedProductsHash } = getSplitProductsHash(productsHashInBasket);

  const updateProductQuantity = (e) => {
    const productId = e.target.name;
    const quantity = parseFloat(e.target.value);

    const currentProductsInBasket = { ...productsHashInBasket };
    const product = productsHashInBasket[productId];
    product.quantity = quantity;
    if (quantity > 0) {
      delete product.removedDuringCheckout;
    } else {
      product.removedDuringCheckout = true;
    }
    currentProductsInBasket[productId] = product;

    setProductsHashBasketDetails(currentProductsInBasket);

  };

  const handleSaveBasket = () => {
    const methodToCall = basketDetails._id ? 'baskets.update' : 'baskets.insert';
    const txtName = refName.current;
    const basket = {
      name: txtName.value,
      products: createProductArrayFromHash(selectedProductsHash.products)
    };

    if (validateBasket(basket)) {
      Meteor.call(methodToCall, basket, (error, basketId) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          const confirmation = basketDetails._id ? 'Basket is updated' : 'New Basket was created';
          Bert.alert(confirmation, 'success');
          history.push('/');
        }
      });
    }
  };

  const validateBasket = ({ name, products }) => {
    if (name.length <= 0) {
      Bert.alert('A basket name is mandatory'), 'warning';
      return false;
    }

    if (products.length <= 0) {
      allSet = false;
      Bert.alert('Please select some products to include in Basket', 'warning');
      return false;
    }
    return true;

  }

  return (
    <div>
      <h3 className="page-header">{basketDetails._id ? 'Update Basket' : 'New Basket'}</h3>
      <div className="panel panel-default">
        <Row>
          <section className="panel-body">
            <Col xs={12} className="text-center">
              {/*<p> You can prefill your order from Baskets you are creating.</p>*/}
              <p> Basket is a list of your favorite products.</p>
              {/* <p> Next time you order, you can save time, by choosing to prefill your cart from Basket you are creating.</p> */}
              <p> Save time, when you order next by selecting a bucket to prefill your cart.</p>
            </Col>
          </section>
          <section className="panel-body">
            <Col xs={12} style={{ display: 'flex', alignItems: 'center', paddingLeft: '10px', marginBottom: '10px' }}>
              <Col xs={3}>
                <p className="noMarginNoPadding">Name</p>
              </Col>
              <Col xs={9}>
                <input type="text"
                  name="basketName"
                  placeholder="Name your basket"
                  className="form-control"
                  ref={refName}
                />
              </Col>
            </Col>
            <Col xs={12}>
              <Row>
                {basketDetails._id}
              </Row>
              <ListProducts
                products={selectedProductsHash.products}
                deletedProducts={deletedProductsHash.products}
                updateProductQuantity={updateProductQuantity}
                isMobile
                isAdmin={Roles.userIsInRole(loggedInUser, constants.Roles.admin.name)}
                isShopOwner={Roles.userIsInRole(loggedInUser, constants.Roles.shopOwner.name)}
              />
              {/* <ListProducts products={deletedProductsState.deletedProducts.productsInCart} deletedProducts={deletedProducts.deletedProducts} updateProductQuantity={updateProductQuantity} isMobile isAdmin={isLoggedInUserAdmin()} /> */}
              <Row>
                <Col xsOffset={1} xs={10} smOffset={3} sm={6}>
                  <Button className="btn-block btn-primary"
                    disabled={selectedProductsHash.count === 0}
                    style={{ marginBottom: '2.5em', marginRight: '.5em' }}
                    onClick={() => { handleSaveBasket(); }}>
                    {basketDetails._id ? 'Save Basket' : 'Create Basket'}
                  </Button>
                </Col>
              </Row>

            </Col>
          </section>
        </Row>
      </div>
    </div>
  );
};

BasketEditor.defaultProps = {
  basketDetails: {},
};

BasketEditor.propTypes = {
  history: PropTypes.object.isRequired,
  basketDetails: PropTypes.object,
  loggedInUser: PropTypes.object.isRequired,
};

export default BasketEditor;

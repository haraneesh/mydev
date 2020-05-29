import { Meteor } from 'meteor/meteor';
import React, { useRef, useState } from 'react';
import { Roles } from 'meteor/alanning:roles';
import PropTypes from 'prop-types';
import { Row, Col, Button } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import constants from '../../../modules/constants';
import { ListProducts, createProductHash } from './BasketCommon';

const createProductArrayFromHash = (productsHash) => {
  const productArray = [];
  Object.keys(productsHash).map((key) => {
    const product = productsHash[key];
    productArray.push({ _id: product._id, quantity: parseFloat(product.quantity) });
  });
  return productArray;
};

const getDeletedProductsHash = (allProductsArray, productsHashInBasket) => {
  const selectedProductsHash = {};
  const notSelectedProductsHash = {};
  allProductsArray.map((prd) => {
    if (!productsHashInBasket[prd._id]) {
      notSelectedProductsHash[prd._id] = prd;
    } else {
      const product = { ...prd, quantity: productsHashInBasket[prd._id].quantity };
      selectedProductsHash[prd._id] = product;
    }
  });

  return {
    selectedProductsHash,
    notSelectedProductsHash,
  };
};

const BasketEditor = ({ history, basketDetails, allProducts, loggedInUser }) => {
  const refName = useRef();
  const refDescription = useRef();
  const allProductHash = createProductHash(allProducts);
  const { selectedProductsHash, notSelectedProductsHash } = getDeletedProductsHash(allProducts, createProductHash(basketDetails.products));
  const [productsHashInBasket, setProductsHashBasketDetails] = useState(selectedProductsHash);
  const [productsHashNotInBasketDetails, setProductsHashNotInBasketDetails] = useState(notSelectedProductsHash);

  const updateProductQuantity = (e) => {
    const productId = e.target.name;
    const quantity = parseFloat(e.target.value);

    const currentProductsInBasket = { ...productsHashInBasket };
    const notSelectedProductsHash = { ...productsHashNotInBasketDetails };
    const product = allProductHash[productId];

    if (quantity > 0) {
      product.quantity = quantity;
      currentProductsInBasket[product._id] = product;
      delete notSelectedProductsHash[product._id];
    } else {
      product.quantity = 0;
      delete currentProductsInBasket[product._id];
      notSelectedProductsHash[product._id] = product;
    }

    setProductsHashBasketDetails(currentProductsInBasket);
    setProductsHashNotInBasketDetails(notSelectedProductsHash);
  };

  const handleSaveBasket = () => {
    const methodToCall = basketDetails._id ? 'baskets.update' : 'baskets.insert';
    const txtName = refName.current;
    const txtDescription = refDescription.current;
    const basket = {
      _id: basketDetails._id,
      name: txtName.value,
      description: txtDescription.value,
      products: createProductArrayFromHash(productsHashInBasket),
    };

    if (validateBasket(basket)) {
      Meteor.call(methodToCall, basket, (error, succ) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          const confirmation = basketDetails._id ? 'Basket is updated' : 'New Basket was created';
          Bert.alert(confirmation, 'success');
          history.goBack();
        }
      });
    }
  };

  const validateBasket = ({ name, products }) => {
    if (name.length <= 0) {
      Bert.alert('A basket name is mandatory', 'warning');
      return false;
    }

    if (products.length <= 0) {
      allSet = false;
      Bert.alert('Please select some products to include in Basket', 'warning');
      return false;
    }
    return true;
  };

  return (
    <div>
      <h3 className="page-header">{basketDetails._id ? 'Update Basket' : 'New Basket'}</h3>
      <div className="panel panel-default">
        <Row>
          <section className="panel-body">
            <Col xs={12} className="text-center">
              {/* <p> You can prefill your order from Baskets you are creating.</p> */}
              <p> Basket is a list of your favorite products.</p>
              {/* <p> Next time you order, you can save time, by choosing to prefill your cart from Basket you are creating.</p> */}
              <p> Save time, when you order next by selecting a bucket to prefill your cart.</p>
            </Col>
          </section>
          <section className="panel-body">
            <Col xs={12} style={{ display: 'flex', alignItems: 'center', paddingLeft: '10px', marginBottom: '10px' }}>
              <Col xs={5} >
                <p className="noMarginNoPadding">Name</p>
              </Col>
              <Col xs={8} className="noMarginNoPadding">
                <input
                  type="text"
                  name="basketName"
                  placeholder="Name your basket"
                  defaultValue={basketDetails.name}
                  className="form-control"
                  ref={refName}
                />
              </Col>
            </Col>
            <Col xs={12} style={{ display: 'flex', alignItems: 'center', paddingLeft: '10px', marginBottom: '10px' }}>
              <Col xs={5} >
                <p className="noMarginNoPadding">Description</p>
              </Col>
              <Col xs={8} className="noMarginNoPadding">
                <textarea
                  name="basketDesc"
                  defaultValue={basketDetails.description}
                  rows="4"
                  placeholder="Describe your basket"
                  className="form-control"
                  ref={refDescription}
                />
              </Col>
            </Col>
          </section>

          <section className="panel-body">
            <Col xs={12}>
              <ListProducts
                products={productsHashInBasket}
                productsNotInBasket={productsHashNotInBasketDetails}
                updateProductQuantity={updateProductQuantity}
                isMobile
                isAdmin={Roles.userIsInRole(loggedInUser, constants.Roles.admin.name)}
                isShopOwner={Roles.userIsInRole(loggedInUser, constants.Roles.shopOwner.name)}
              />
            </Col>
          </section>
        </Row>
      </div>
      <div style={{ position: 'fixed', bottom: '0px', backgroundColor: '#fff', width: '100%', zIndex: '9999', left: '-2px' }} >
        <Col xsOffset={1} xs={10} smOffset={3} sm={6}>
          <Button
            className="btn-block btn-primary"
            disabled={Object.keys(productsHashInBasket).length === 0}
            style={{ marginBottom: '.5em', marginTop: '.5em' }}
            onClick={() => { handleSaveBasket(); }}
          >
            {basketDetails._id ? 'Save Basket' : 'Create Basket'}
          </Button>
        </Col>
      </div>
    </div >
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

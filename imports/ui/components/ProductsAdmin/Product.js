import { Roles } from 'meteor/alanning:roles';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { toast } from 'react-toastify';
import { removeProduct, upsertProduct } from '../../../api/Products/methods.js';
import constants from '../../../modules/constants';
import Checkbox from '../Common/Checkbox';
import ProductDetails from './ProductDetails';

import './Product.scss';

export const ProductTableHeader = () => (
  <ListGroupItem>
    <Row>
      <Col xs={1}>&nbsp;</Col>
      <Col xs={2}>Product Name</Col>
      <Col xs={2}>Retail Price</Col>
      <Col xs={1}>Retail ordered?</Col>
      <Col xs={1}>Unit Of Sale</Col>
      <Col xs={2}>Whole Sale Price</Col>
      <Col xs={1}>WH ordered?</Col>
      <Col xs={1}>Special?</Col>
      <Col xs={1} />
    </Row>
  </ListGroupItem>
);

/* <thead>
   <tr>
     <th>#</th>
      <th>DP</th>
     <th>Product Name</th>
     <th>Unit Price</th>
     <th>Unit Of Sale</th>
     <th>Units For Selection</th>
     <th>Can be ordered?</th>
     <th />
   </tr>
 </thead>
*/

function FieldGroup({
  controlType,
  controlLabel,
  controlName,
  updateValue,
  defaultValue,
  unitOfSale,
  choiceValues,
  displayControlName = false,
  help,
  ...props
}) {
  const values = choiceValues && choiceValues.slice();
  if (values) {
    values.unshift(constants.SELECT_EMPTY_VALUE);
  }

  if (controlType === 'select') {
    return (
      <Row>
        {displayControlName && <label>{controlLabel}</label>}

        <Form.Select
          size="sm"
          value={defaultValue}
          name={controlName}
          onChange={updateValue}
        >
          {values &&
            values.map((optionValue, index) => (
              <option
                value={optionValue._id ? optionValue._id : optionValue}
                key={`prd-${index}`}
              >
                {optionValue.name ? optionValue.name : optionValue}
              </option>
            ))}
        </Form.Select>
      </Row>
    );
  }

  return (
    <Row>
      {displayControlName && <label>{controlLabel}</label>}
      <Form.Control
        size="sm"
        type={controlType}
        name={controlName}
        defaultValue={defaultValue}
        onBlur={updateValue}
        as={controlType === 'textarea' ? 'textarea' : 'input'}
        {...props}
      />
      {help && <Form.Text className="text-dark">{help}</Form.Text>}
    </Row>
  );
}

export default function Product(props) {
  const { product, returnableProducts } = props;
  const [state, setState] = useState({
    product: { ...product },
    open: false,
    returnablesHash: retIdToObjHash(returnableProducts),
    showDetails: false,
  });

  function showDetailsPage(showDetails) {
    const newState = Object.assign({}, state);
    newState.showDetails = showDetails;
    setState(newState);
  }

  function launchProductDetails({ productId, productName, showDetails }) {
    return (
      <Modal
        show={showDetails}
        onHide={() => {
          showDetailsPage(false);
        }}
        className="modalProductDetails"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <h4> {productName} </h4>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row>
            <ProductDetails
              productId={productId}
              closeFunction={() => {
                showDetailsPage(false);
              }}
            />
          </Row>
        </Modal.Body>
      </Modal>
    );
  }

  function retIdToObjHash(objArray /* _id, name */) {
    return objArray.reduce((map, obj) => {
      map[obj._id] = obj;
      return map;
    }, {});
  }

  function handleRemoveProduct(event) {
    event.preventDefault();
    const productId = event.target.name;
    if (
      confirm(
        `Do you want to remove the product ${state.product.name}? This is permanent!`,
      )
    ) {
      removeProduct.call(
        {
          _id: productId,
        },
        (error) => {
          if (error) {
            toast.error(error.reason);
          } else {
            toast.success('Product removed!', 'info');
          }
        },
      );
    }
  }

  function handleProductUpsert(event) {
    const selectedValue = event.target.value.trim();
    const field = event.target.name;
    const { product, returnablesHash } = state;

    let valueToUpdate;
    switch (field) {
      case 'availableToOrder':
        valueToUpdate = !product.availableToOrder;
        break;
      case 'availableToOrderWH':
        valueToUpdate = !product.availableToOrderWH;
        break;
      case 'displayAsSpecial':
        valueToUpdate = !product.displayAsSpecial;
        break;
      case 'frequentlyOrdered':
        valueToUpdate = !product.frequentlyOrdered;
        break;
      case 'includeReturnables':
        valueToUpdate = !product.includeReturnables;
        break;
      case 'associatedReturnables':
        valueToUpdate =
          selectedValue !== constants.SELECT_EMPTY_VALUE
            ? {
                ...returnablesHash[selectedValue],
              }
            : null;
        break;
      default:
        valueToUpdate = selectedValue;
        break;
    }

    const currentValue = product[field] ? product[field] : '';

    if (valueToUpdate !== currentValue.toString()) {
      product[field] = valueToUpdate;
      const newState = Object.assign({}, state);
      newState.product = product;
      setState(newState);
      updateDatabase();
    }
  }

  function updateDatabase() {
    const confirmation = 'Product updated!';
    const upsert = { ...state.product };
    upsert.unitprice = parseFloat(upsert.unitprice);
    upsert.wSaleBaseUnitPrice = parseFloat(upsert.wSaleBaseUnitPrice);
    upsert.maxUnitsAvailableToOrder = parseFloat(
      upsert.maxUnitsAvailableToOrder,
    );

    const returnableUnitsForSelection = upsert.returnableUnitsForSelection
      ? upsert.returnableUnitsForSelection
      : '0=0, 0.5=100, 1=200';
    delete upsert.returnableUnitsForSelection;
    if (upsert.includeReturnables) {
      upsert.associatedReturnables.returnableUnitsForSelection =
        returnableUnitsForSelection;
    }

    // upsert.displayOrder = parseFloat(upsert.displayOrder);
    delete upsert.displayOrder;

    //upsert.sourceSuppliers = this.removeDeletedSourceSuppliers(upsert.sourceSuppliers);
    delete upsert.sourceSuppliers;
    delete upsert.associatedFoodGroups;

    upsertProduct.call(upsert, (error) => {
      if (error) {
        const errReason = error.reason ? error.reason : error.message;
        toast.error(errReason);
      } else {
        toast.success(confirmation, 'info');
      }
    });
  }

  const isSuperAdmin = Roles.userIsInRole(
    Meteor.userId(),
    constants.Roles.superAdmin.name,
  );
  return (
    <ListGroupItem>
      <Row>
        <Col xs={1}>{props.productIndex + 1}</Col>
        <Col xs={2}>
          <FieldGroup
            controlType="text"
            controlLabel="Name"
            controlName="name"
            updateValue={handleProductUpsert}
            defaultValue={product.name}
            disabled={!isSuperAdmin}
            help
          />
        </Col>
        <Col xs={2}>
          <FieldGroup
            controlType="number"
            controlLabel="Unit Price"
            controlName="unitprice"
            updateValue={handleProductUpsert}
            defaultValue={product.unitprice}
            disabled={!isSuperAdmin}
            help
          />
        </Col>
        <Col xs={1} className="d-flex justify-content-center">
          <Checkbox
            name="availableToOrder"
            checked={state.product.availableToOrder}
            onChange={handleProductUpsert}
          >
            {/* Is Available To Order */}
          </Checkbox>
        </Col>
        <Col xs={1}>
          <FieldGroup
            controlType="text"
            controlLabel="Unit Of Sale"
            controlName="unitOfSale"
            updateValue={handleProductUpsert}
            defaultValue={product.unitOfSale}
            help
          />
        </Col>
        <Col xs={2}>
          <FieldGroup
            controlType="number"
            controlLabel="Whole Price"
            controlName="wSaleBaseUnitPrice"
            updateValue={handleProductUpsert}
            defaultValue={product.wSaleBaseUnitPrice}
            // defaultValue={this.props.product.sourceSupplier ? this.props.product.sourceSupplier._id : ''}
            // choiceValues={this.props.suppliers}
            disabled={!isSuperAdmin}
            help
          />
        </Col>
        <Col xs={1} className="d-flex justify-content-center">
          <Checkbox
            name="availableToOrderWH"
            checked={state.product.availableToOrderWH}
            onChange={handleProductUpsert}
          />
        </Col>
        <Col xs={1} className="d-flex justify-content-center">
          <Checkbox
            name="displayAsSpecial"
            checked={state.product.displayAsSpecial}
            onChange={handleProductUpsert}
          >
            {/* Display this as special? */}
          </Checkbox>
        </Col>
        <Col xs={1}>
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              const newState = Object.assign({}, state);
              newState.open = !state.open;
              setState(newState);
            }}
          >
            {state.open ? <span>&#9650;</span> : <span>&#9660;</span>}
          </Button>
        </Col>
      </Row>
      {state.open && (
        <Alert variant="primary" className="mt-2">
          <Row className="py-2">
            <Col xs={1} />

            <Col xs={4}>
              <FieldGroup
                controlType="number"
                controlLabel="Max Units Available"
                controlName="maxUnitsAvailableToOrder"
                displayControlName="true"
                updateValue={handleProductUpsert}
                defaultValue={
                  product.maxUnitsAvailableToOrder &&
                  product.maxUnitsAvailableToOrder > 0
                    ? product.maxUnitsAvailableToOrder
                    : ''
                }
                help
              />
            </Col>
            {/* <Col xs={1}>
              <FieldGroup
                controlType="number"
                controlLabel="Display Order"
                controlName="displayOrder"
                displayControlName="true"
                updateValue={this.handleProductUpsert}
                defaultValue={(product.displayOrder) ?
                  product.displayOrder : ''}
                help
              />
                </Col>
            <Col xs={3}>
               <FieldGroup
                controlType="select"
                controlLabel="Category"
                controlName="category"
                displayControlName="true"
                updateValue={this.handleProductUpsert}
                defaultValue={this.props.product.category}
                choiceValues={constants.ProductCategory}
                help
              /> */}
            <Col>
              <FieldGroup
                controlType="select"
                controlLabel="Type"
                controlName="type"
                displayControlName="true"
                updateValue={handleProductUpsert}
                defaultValue={product.type}
                choiceValues={constants.ProductTypeNameArray}
                help
              />
            </Col>
            <Col>
              <FieldGroup
                controlType="text"
                controlLabel="Category"
                controlName="category"
                displayControlName="true"
                updateValue={handleProductUpsert}
                defaultValue={product.category}
                help
              />
            </Col>
          </Row>
          <Row className="py-2">
            <Col xs={1} />
            <Col xs={7}>
              <FieldGroup
                controlType="textarea"
                controlLabel="Description"
                controlName="description"
                displayControlName="true"
                updateValue={handleProductUpsert}
                defaultValue={product.description}
                help
              />
            </Col>
            <Col xs={4}>
              <FieldGroup
                controlType="text"
                controlLabel="Image URL"
                controlName="image_path"
                displayControlName="true"
                updateValue={handleProductUpsert}
                defaultValue={product.image_path}
                help
              />
            </Col>
          </Row>
          <Row className="py-2">
            <Col xs={1} />
            <Col xs={4}>
              <Checkbox
                name="frequentlyOrdered"
                checked={state.product.frequentlyOrdered}
                onChange={handleProductUpsert}
              >
                Frequently Ordered
              </Checkbox>
            </Col>
            <Col>
              <FieldGroup
                controlType="text"
                controlLabel="SKU"
                controlName="sku"
                displayControlName="true"
                updateValue={handleProductUpsert}
                defaultValue={product.sku}
                help
              />
            </Col>
            <Col>
              <FieldGroup
                controlType="text"
                controlLabel="Units For Selection"
                controlName="unitsForSelection"
                displayControlName="true"
                updateValue={handleProductUpsert}
                defaultValue={product.unitsForSelection}
                help="Example: 1,2,3=5%,4=10%,5=10%,6=12%"
              />
            </Col>
          </Row>
          {/*}
          <Row className="py-2">
            <Col xs={1} />
            <Col>
              <FieldGroup
                style={{ height: '170px' }}
                controlType="select"
                controlLabel="Food Group"
                controlName="associatedFoodGroups"
                displayControlName="true"
                updateValue={handleProductUpsert}
                defaultValue={product.associatedFoodGroups}
                choiceValues={constants.FoodGroups.names}
                multiple
                help
              />
            </Col>
          </Row>*/}
          <Row>
            <Col xs={1} />
            <Col>
              <Checkbox
                name="includeReturnables"
                checked={state.product.includeReturnables}
                onChange={handleProductUpsert}
              >
                Include Returnables
              </Checkbox>
            </Col>
            <Col>
              {state.product.includeReturnables && (
                <FieldGroup
                  style={{ height: '170px' }}
                  controlType="select"
                  controlLabel="Returnable"
                  controlName="associatedReturnables"
                  displayControlName="true"
                  updateValue={handleProductUpsert}
                  defaultValue={
                    product.associatedReturnables &&
                    product.associatedReturnables._id
                      ? product.associatedReturnables._id
                      : ''
                  }
                  choiceValues={props.returnableProducts}
                  multiple
                  help
                />
              )}
            </Col>
            <Col>
              {state.product.includeReturnables && (
                <FieldGroup
                  controlType="text"
                  controlLabel="Returnable Units For Selection"
                  controlName="returnableUnitsForSelection"
                  displayControlName="true"
                  updateValue={handleProductUpsert}
                  defaultValue={
                    product.associatedReturnables
                      ? product.associatedReturnables
                          .returnableUnitsForSelection
                      : ''
                  }
                  help
                />
              )}
            </Col>
          </Row>
          <Row className="py-2">
            <Col xs={1} />
            <Col>
              <Button
                size="sm"
                name={product._id}
                onClick={handleRemoveProduct}
              >
                Delete Product
              </Button>
            </Col>

            {launchProductDetails({
              productId: product._id,
              productName: product.name,
              showDetails: state.showDetails,
            })}

            <Col>
              <Button
                size="sm"
                variant="info"
                onClick={() => {
                  showDetailsPage(true);
                }}
              >
                Edit Product Detail
              </Button>
            </Col>
          </Row>
        </Alert>
      )}
    </ListGroupItem>
  );
}

Product.propTypes = {
  productIndex: PropTypes.number.isRequired,
  prodId: PropTypes.string.isRequired,
  product: PropTypes.object.isRequired,
  suppliers: PropTypes.array.isRequired,
  returnableProducts: PropTypes.array.isRequired,
};

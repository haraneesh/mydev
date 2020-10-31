import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Table, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getDayWithoutTime } from '../../../modules/helpers';
import ProductRow from './ProductRow';

export default class ReconcileInventoryMain extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.onValueChange = this.onValueChange.bind(this);
    this.state = {
      ItemHash: [],
    };
    this.getItemsFromZoho = this.getItemsFromZoho.bind(this);
    this.onReconcileButtonClick = this.onReconcileButtonClick.bind(this);
    this.createProductRecordsForSaving = this.createProductRecordsForSaving.bind(this);
  }

  componentDidMount() {
    this.getItemsFromZoho();
  }

  onReconcileButtonClick() {
    const { inactiveProducts, productArray } = this.createProductRecordsForSaving();
    const doc = {
      createdOn: getDayWithoutTime(new Date()),
      products: productArray,
    };

    if (inactiveProducts.length > 0) {
      toast.error(`Following ${inactiveProducts} are not active in Zoho!`);
    }

    Meteor.call('reconcileInventory.upsert', doc, (error) => {
      if (error) {
        toast.error(error.reason);
      } else {
        toast.success('Created a record.');
      }
    });
  }

  onValueChange(event) {
    if (event.target.value === '') {
      return;
    }
    const zohoItemId = event.target.name;
    const physicalInventory = parseFloat(event.target.value);
    const { ItemHash } = this.state;
    ItemHash[zohoItemId].differenceQty = this.calcDifferenceQty(ItemHash[zohoItemId].stock_on_hand, physicalInventory);
    ItemHash[zohoItemId].physicalInventory = physicalInventory;
    this.setState({
      ItemHash,
    });

    // this.productValuesEntered[productId] = enteredValue;
  }

  getItemsFromZoho() {
    Meteor.call('products.getItemsFromZoho', (error, activeZohoItems) => {
      if (error) {
        toast.error(error.reason);
      } else {
        this.setState({
          ItemHash: this.returnItemsHash(activeZohoItems),
        });
      }
    });
  }

  createProductRecordsForSaving() {
    const { ItemHash } = this.state;
    let inactiveProducts = '';
    const productArray = this.props.products.reduce((map, prd) => {
      const key = prd.zh_item_id;

      if (ItemHash[key]) {
        const product = {
          productId: prd._id,
          productName: ItemHash[key].name,
          zohoProductInventory: parseFloat(ItemHash[key].stock_on_hand),
          reportedPhysicalInventory: ItemHash[key].physicalInventory,
          unit: ItemHash[key].unit,
          differenceQty: this.calcDifferenceQty(ItemHash[key].stock_on_hand, ItemHash[key].physicalInventory),
        };
        map.push(product);
      } else {
        inactiveProducts += `, ${prd.name}`;
        // console.log('error');
      }
      return map;
    }, []);

    return {
      productArray,
      inactiveProducts,
    };
  }

  returnItemsHash(listArray) {
    return listArray.reduce((map, listItem) => {
      map[listItem.item_id] = listItem;
      map[listItem.item_id].physicalInventory = 0;
      map[listItem.item_id].differenceQty = this.calcDifferenceQty(listItem.stock_on_hand, 0);
      return map;
    }, []);
  }

  calcDifferenceQty(stockOnHand, physicalInventory) {
    return Math.round((physicalInventory - stockOnHand) * 100) / 100;
  }

  render() {
    const { products } = this.props;
    const { ItemHash } = this.state;
    return (
      products.length ? (
        <div>
          <Table responsive>
            <thead>
              <tr>
                <th>Product</th>
                <th>Inventory in Zoho</th>
                <th>Unit</th>
                <th>Physical Inventory</th>
                <th>Missing</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                let stockOnHand = '-';
                let unit = '-';
                let differenceQty = 0;
                if (ItemHash[product.zh_item_id]) {
                  stockOnHand = ItemHash[product.zh_item_id].stock_on_hand;
                  unit = ItemHash[product.zh_item_id].unit;
                  differenceQty = ItemHash[product.zh_item_id].differenceQty;
                }
                return (
                  <ProductRow
                    key={product.zh_item_id}
                    product={product}
                    productQtyInZoho={stockOnHand}
                    unit={unit}
                    differenceQty={differenceQty}
                    onValueChange={this.onValueChange}
                  />
                );
              })}
            </tbody>
          </Table>
          <Button bsSize="small" onClick={this.onReconcileButtonClick}>Save</Button>
        </div>
      ) : <Alert bsStyle="warning">No products are active!</Alert>
    );
  }
}

ReconcileInventoryMain.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
};

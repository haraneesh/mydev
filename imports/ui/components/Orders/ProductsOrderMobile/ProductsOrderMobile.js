import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import Accordion from 'react-bootstrap/Accordion';
import { toast } from 'react-toastify';
import constants from '../../../../modules/constants';
import { DisplayCategoryHeader } from '../ProductsOrderCommon/ProductsOrderCommon';
import { isChennaiPinCode } from '../../../../modules/helpers';

import './ProductsOrderMobile.scss';

export default class ProductsOrderMobile extends React.Component {
  constructor(props, context) {
    super(props, context);

    const totalBillAmount = (props.totalBillAmount) ? props.totalBillAmount : 0;

    this.state = {
      products: this.props.productsArray,
      totalBillAmount,
      panelToFocus: 'spcl-header', // ''
      recommendations: this.props.recommendations,
      // recommendations: [], // do not show recommendations,
      scrollToLocation: false,
    };

    this.handlePanelSelect = this.handlePanelSelect.bind(this);
    this.displayProductsByTypeStandardView = this.displayProductsByTypeStandardView.bind(this);
  }

  componentDidMount() {
    Meteor.call('users.visitedPlaceNewOrder', (error) => {
      if (error && Meteor.isDevelopment) {
        toast.error(error.reason);
      }
    });
  }

  componentDidUpdate() {
    if (this.state.scrollToLocation) {
      if (this.state.panelToFocus) {
        setTimeout((toFocus) => {
          document.getElementById(toFocus).scrollIntoView({ behavior: 'smooth' });
        }, 150, this.state.panelToFocus);
      }
      this.setState({
        scrollToLocation: false,
      });
    }
  }

  handlePanelSelect(panelToFocus) {
    this.setState({
      panelToFocus: (this.state.panelToFocus === panelToFocus ? '' : panelToFocus),
      scrollToLocation: true,
    });
  }

  displayProductsByType() {
    const { productGroups } = this.props;
    return this.displayProductsByTypeStandardView(productGroups);
  }

  displayProductsByTypeStandardView(productGroups) {
    const { productVegetables } = productGroups;
    const { productFruits } = productGroups;
    const { productDhals } = productGroups;
    const { productGrains } = productGroups;
    const { productSpices } = productGroups;
    const { productOils } = productGroups;
    const { productPrepared } = productGroups;
    const { productHygiene } = productGroups;
    const { productSweetners } = productGroups;
    const { productSpecials } = productGroups;
    const { productFlours } = productGroups;
    const { productBatter } = productGroups;
    const { productSnacks } = productGroups;

    const productRecommended = [];

    const isDeliveryInChennai = isChennaiPinCode(this.props.deliveryPincode);

    // const expanded = this.state.panelToFocus !== '';
    return (
      <div className="productOrderList">
        <Accordion id="accordion" defaultActiveKey="2">
          {productRecommended.length > 0 && (
          <div id="fav-header">
            <Accordion.Item
              // onSelect={( === 'fav-header')}
              eventKey="1"
              className="stickyHeader my-1"
            >
              <Accordion.Header>
                <DisplayCategoryHeader
                  clName="recommended_bk_ph"
                  title="My Favourites"
                  onclick={() => this.handlePanelSelect('fav-header')}
                  isOpen={this.state.panelToFocus === 'fav-header'}
                  tabHash={productGroups.productGroupMetaHash.productRecommended}
                />
              </Accordion.Header>
              <Accordion.Body>
                { productRecommended }
              </Accordion.Body>
            </Accordion.Item>
          </div>
          )}

          {productSpecials.length > 0 && (
            <div id="spcl-header">
              <Accordion.Item
                className="stickyHeader my-1"
                // onSelect={( === 'spcl-header')}
                eventKey="2"
              >
                <Accordion.Header>
                  <DisplayCategoryHeader
                    clName="specials_bk_ph"
                    title="New Arrivals"
                    isOpen={this.state.panelToFocus === 'spcl-header'}
                    onclick={() => this.handlePanelSelect('spcl-header')}
                    tabHash={productGroups.productGroupMetaHash.productSpecials}
                  />
                </Accordion.Header>
                <Accordion.Body>
                  <div className="row mb-4">
                    { productSpecials }
                  </div>
                </Accordion.Body>

              </Accordion.Item>
            </div>
          )}

          {productGrains.length > 0 && (
          <div id="grain-header">
            <Accordion.Item
              // id="grain-header"
              // onSelect={( === 'grain-header')}
              eventKey="3"
              className="stickyHeader my-1"
            >

              <Accordion.Header>
                <DisplayCategoryHeader
                  clName="grains_bk_ph"
                  title={constants.ProductTypeName.Grains.display_name} // "Grains & Flour"
                  onclick={() => this.handlePanelSelect('grain-header')}
                  isOpen={this.state.panelToFocus === 'grain-header'}
                  tabHash={productGroups.productGroupMetaHash.productGrains}
                />
              </Accordion.Header>

              <Accordion.Body>
                <div className="row mb-4">
                  { productGrains }
                </div>
              </Accordion.Body>

            </Accordion.Item>
          </div>
          )}

          {productDhals.length > 0 && (
          <div id="dhals-header">
            <Accordion.Item
              // onSelect={( === 'dhals-header')}
              eventKey="4"
              className="stickyHeader my-1"
            >
              <Accordion.Header>
                <DisplayCategoryHeader
                  clName="dhals_bk_ph"
                  title={constants.ProductTypeName.Dhals.display_name} // "Pulses, Lentils & Dried Beans"
                  onclick={() => this.handlePanelSelect('dhals-header')}
                  isOpen={this.state.panelToFocus === 'dhals-header'}
                  tabHash={productGroups.productGroupMetaHash.productDhals}
                />
              </Accordion.Header>
              <Accordion.Body>
                <div className="row mb-4">
                  { productDhals }
                </div>
              </Accordion.Body>

            </Accordion.Item>
          </div>
          )}

          {productFlours.length > 0 && (
          <div id="flours-header">
            <Accordion.Item
              // onSelect={( === 'flours-header')}
              eventKey="5"
              className="stickyHeader my-1"
            >
              <Accordion.Header>
                <DisplayCategoryHeader
                  clName="flours_bk_ph"
                  title={constants.ProductTypeName.Flours.display_name} // "Flours"
                  onclick={() => this.handlePanelSelect('flours-header')}
                  isOpen={this.state.panelToFocus === 'flours-header'}
                  tabHash={productGroups.productGroupMetaHash.productFlours}
                />
              </Accordion.Header>
              <Accordion.Body>
                <div className="row mb-4">
                  { productFlours }

                </div>
              </Accordion.Body>
            </Accordion.Item>
          </div>
          )}

          {productBatter.length > 0 && isDeliveryInChennai && (
          <div id="batter-header">
            <Accordion.Item
              // onSelect={( === 'batter-header')}
              eventKey="6"
              className="stickyHeader my-1"
            >
              <Accordion.Header>
                <DisplayCategoryHeader
                  clName="batter_bk_ph"
                  title={constants.ProductTypeName.Batter.display_name} // "Batter"
                  onclick={() => this.handlePanelSelect('batter-header')}
                  isOpen={this.state.panelToFocus === 'batter-header'}
                  tabHash={productGroups.productGroupMetaHash.productBatter}
                />
              </Accordion.Header>
              <Accordion.Body>
                <div className="row mb-4">
                  { productBatter }

                </div>
              </Accordion.Body>

            </Accordion.Item>
          </div>
          )}

          {productVegetables.length > 0 && isDeliveryInChennai && (
          <div id="veg-header">
            <Accordion.Item
              // onSelect={( === 'veg-header')}
              eventKey="7"
              className="stickyHeader my-1"
            >
              <Accordion.Header>
                <DisplayCategoryHeader
                  clName="vegetables_bk_ph"
                  title={constants.ProductTypeName.Vegetables.display_name} // "Vegetables"
                  onclick={() => this.handlePanelSelect('veg-header')}
                  isOpen={this.state.panelToFocus === 'veg-header'}
                  tabHash={productGroups.productGroupMetaHash.productVegetables}
                />

              </Accordion.Header>
              <Accordion.Body>
                <div className="row mb-4">
                  { productVegetables }

                </div>
              </Accordion.Body>
            </Accordion.Item>
          </div>
          )}

          {productFruits.length > 0 && isDeliveryInChennai && (
          <div id="fruits-header">
            <Accordion.Item
              // onSelect={( === 'fruits-header')}
              eventKey="8"
              className="stickyHeader my-1"
            >
              <Accordion.Header>
                <DisplayCategoryHeader
                  clName="fruits_bk_ph"
                  title={constants.ProductTypeName.Fruits.display_name} // "Fruits"
                  onclick={() => this.handlePanelSelect('fruits-header')}
                  isOpen={this.state.panelToFocus === 'fruits-header'}
                  tabHash={productGroups.productGroupMetaHash.productFruits}
                />
              </Accordion.Header>
              <Accordion.Body>
                <div className="row mb-4">
                  { productFruits }

                </div>
              </Accordion.Body>

            </Accordion.Item>
          </div>
          )}

          {productSpices.length > 0 && (
          <div id="spices-header">
            <Accordion.Item
              // onSelect={( === 'spices-header')}
              eventKey="9"
              className="stickyHeader my-1"
            >
              <Accordion.Header>
                <DisplayCategoryHeader
                  clName="spices_bk_ph"
                  title={constants.ProductTypeName.Spices.display_name} // "Spices & Nuts"
                  onclick={() => this.handlePanelSelect('spices-header')}
                  isOpen={this.state.panelToFocus === 'spices-header'}
                  tabHash={productGroups.productGroupMetaHash.productSpices}
                />
              </Accordion.Header>
              <Accordion.Body>
                <div className="row mb-4">
                  { productSpices }

                </div>
              </Accordion.Body>
            </Accordion.Item>
          </div>
          )}

          {productOils.length > 0 && (
          <div id="oils-header">
            <Accordion.Item
              // onSelect={( === 'oils-header')}
              eventKey="10"
              className="stickyHeader my-1"
            >
              <Accordion.Header>
                <DisplayCategoryHeader
                  clName="oils_bk_ph"
                  title={constants.ProductTypeName.Oils.display_name} // "Oils, Butter & Ghee"
                  onclick={() => this.handlePanelSelect('oils-header')}
                  isOpen={this.state.panelToFocus === 'oils-header'}
                  tabHash={productGroups.productGroupMetaHash.productOils}
                />
              </Accordion.Header>
              <Accordion.Body>
                <div className="row mb-4">
                  { productOils}
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </div>
          )}

          {productSweetners.length > 0 && (
          <div id="swt-header">
            <Accordion.Item
              // onSelect={( === 'swt-header')}
              eventKey="11"
              className="stickyHeader my-1"
            >
              <Accordion.Header>
                <DisplayCategoryHeader
                  clName="swt_bk_ph"
                  title={constants.ProductTypeName.Sweetners.display_name} // "Sweetners"
                  onclick={() => this.handlePanelSelect('swt-header')}
                  isOpen={this.state.panelToFocus === 'swt-header'}
                  tabHash={productGroups.productGroupMetaHash.productSweetners}
                />
              </Accordion.Header>
              <Accordion.Body>
                <div className="row mb-4">
                  { productSweetners}
                </div>
              </Accordion.Body>

            </Accordion.Item>
          </div>
          )}

          {productSnacks.length > 0 && (
          <div id="snacks-header">
            <Accordion.Item
              // onSelect={( === 'snacks-header')}
              eventKey="12"
              className="stickyHeader my-1"
            >
              <Accordion.Header>
                <DisplayCategoryHeader
                  clName="snack_bk_ph"
                  title={constants.ProductTypeName.Snacks.display_name} // "Snacks"
                  onclick={() => this.handlePanelSelect('snacks-header')}
                  isOpen={this.state.panelToFocus === 'snacks-header'}
                  tabHash={productGroups.productGroupMetaHash.productSnacks}
                />
              </Accordion.Header>
              <Accordion.Body>
                <div className="row mb-4">
                  { productSnacks}
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </div>
          )}

          {productPrepared.length > 0 && (
          <div id="prepared-header">
            <Accordion.Item
              // onSelect={( === 'prepared-header')}
              eventKey="13"
              className="stickyHeader my-1"
            >
              <Accordion.Header>
                <DisplayCategoryHeader
                  clName="prepared_bk_ph"
                  title={constants.ProductTypeName.Prepared.display_name} // "Pickles & Podis"
                  onclick={() => this.handlePanelSelect('prepared-header')}
                  isOpen={this.state.panelToFocus === 'prepared-header'}
                  tabHash={productGroups.productGroupMetaHash.productPrepared}
                />
              </Accordion.Header>
              <Accordion.Body>
                <div className="row mb-4">
                  { productPrepared}
                </div>
              </Accordion.Body>

            </Accordion.Item>
          </div>
          )}

          {productHygiene.length > 0 && (
          <div id="hyg-header">
            <Accordion.Item
              // onSelect={( === 'hyg-header')}
              eventKey="14"
              className="stickyHeader my-1"
            >
              <Accordion.Header>
                <DisplayCategoryHeader
                  clName="hyg_bk_ph"
                  title={constants.ProductTypeName.Hygiene.display_name} // "Personal & General Hygiene"
                  onclick={() => this.handlePanelSelect('hyg-header')}
                  isOpen={this.state.panelToFocus === 'hyg-header'}
                  tabHash={productGroups.productGroupMetaHash.productHygiene}
                />
              </Accordion.Header>
              <Accordion.Body>
                <div className="row mb-4">
                  { productHygiene }
                </div>
              </Accordion.Body>

            </Accordion.Item>
          </div>
          )}

        </Accordion>
      </div>
    );
  }

  render() {
    return (
      this.displayProductsByType(this.state.products)
    );
  }
}

ProductsOrderMobile.defaultProps = {
  productGroupSelected: 0,
  orderId: '',
  orderStatus: '',
  comments: '',
  totalBillAmount: 0,
  dateValue: new Date(),
};

ProductsOrderMobile.propTypes = {
  productGroups: PropTypes.array.isRequired,
  productsArray: PropTypes.object.isRequired,
  productGroupSelected: PropTypes.number,
  recommendations: PropTypes.array.isRequired,
  orderId: PropTypes.string,
  orderStatus: PropTypes.string,
  comments: PropTypes.string,
  totalBillAmount: PropTypes.number,
  dateValue: PropTypes.object,
  history: PropTypes.object.isRequired,
};

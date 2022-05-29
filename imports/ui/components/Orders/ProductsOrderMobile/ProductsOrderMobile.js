import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { Panel, PanelGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import constants from '../../../../modules/constants';
import { DisplayCategoryHeader } from '../ProductsOrderCommon/ProductsOrderCommon';

import './ProductsOrderMobile.scss';

export default class ProductsOrderMobile extends React.Component {
  constructor(props, context) {
    super(props, context);

    const totalBillAmount = (props.totalBillAmount) ? props.totalBillAmount : 0;

    this.state = {
      products: this.props.productsArray,
      totalBillAmount,
      panelToFocus: '',
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
        document.getElementById(this.state.panelToFocus).scrollIntoView({ behavior: 'smooth' });
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

    // const expanded = this.state.panelToFocus !== '';
    return (
      <div className="productOrderList">
        <PanelGroup activeKey={this.state.activePanel} id="accordion">
          {productRecommended.length > 0 && (
          <div id="fav-header">
            <Panel
              header={(
                <DisplayCategoryHeader
                  clName="recommended_bk_ph"
                  title="My Favourites"
                  onclick={() => this.handlePanelSelect('fav-header')}
                  isOpen={this.state.panelToFocus === 'fav-header'}
                  tabHash={productGroups.productGroupMetaHash.productRecommended}
                />
)}
              expanded={(this.state.panelToFocus === 'fav-header')}
            >
              {(this.state.panelToFocus === 'fav-header') && productRecommended}
            </Panel>
          </div>
          )}

          {productSpecials.length > 0 && (
            <div id="spcl-header">
              <Panel
                className="stickyHeader"
                header={(
                  <DisplayCategoryHeader
                    clName="specials_bk_ph"
                    title="New Arrivals"
                    isOpen={this.state.panelToFocus === 'spcl-header'}
                    onclick={() => this.handlePanelSelect('spcl-header')}
                    tabHash={productGroups.productGroupMetaHash.productSpecials}
                  />
)}
                expanded={(this.state.panelToFocus === 'spcl-header')}
              >
                <div className="row">
                  {(this.state.panelToFocus === 'spcl-header') && productSpecials}
                </div>
              </Panel>
            </div>
          )}

          {productGrains.length > 0 && (
          <div id="grain-header">
            <Panel
              id="grain-header"
              header={(
                <DisplayCategoryHeader
                  clName="grains_bk_ph"
                  title={constants.ProductTypeName.Grains.display_name} // "Grains & Flour"
                  onclick={() => this.handlePanelSelect('grain-header')}
                  isOpen={this.state.panelToFocus === 'grain-header'}
                  tabHash={productGroups.productGroupMetaHash.productGrains}
                />
)}
              expanded={(this.state.panelToFocus === 'grain-header')}
              eventKey="5"
            >
              <div className="row">
                {(this.state.panelToFocus === 'grain-header') && productGrains}
              </div>
            </Panel>
          </div>
          )}

          {productDhals.length > 0 && (
          <div id="dhals-header">
            <Panel
              header={(
                <DisplayCategoryHeader
                  clName="dhals_bk_ph"
                  title={constants.ProductTypeName.Dhals.display_name} // "Pulses, Lentils & Dried Beans"
                  onclick={() => this.handlePanelSelect('dhals-header')}
                  isOpen={this.state.panelToFocus === 'dhals-header'}
                  tabHash={productGroups.productGroupMetaHash.productDhals}
                />
)}
              expanded={(this.state.panelToFocus === 'dhals-header')}
              eventKey="6"
            >
              <div className="row">
                {(this.state.panelToFocus === 'dhals-header') && productDhals}
              </div>
            </Panel>
          </div>
          )}

          {productFlours.length > 0 && (
          <div id="flours-header">
            <Panel
              header={(
                <DisplayCategoryHeader
                  clName="flours_bk_ph"
                  title={constants.ProductTypeName.Flours.display_name} // "Flours"
                  onclick={() => this.handlePanelSelect('flours-header')}
                  isOpen={this.state.panelToFocus === 'flours-header'}
                  tabHash={productGroups.productGroupMetaHash.productFlours}
                />
          )}
              expanded={(this.state.panelToFocus === 'flours-header')}
              eventKey="10"
            >
              <div className="row">
                {(this.state.panelToFocus === 'flours-header') && productFlours}
              </div>
            </Panel>
          </div>
          )}

          {productBatter.length > 0 && (
          <div id="batter-header">
            <Panel
              header={(
                <DisplayCategoryHeader
                  clName="batter_bk_ph"
                  title={constants.ProductTypeName.Batter.display_name} // "Batter"
                  onclick={() => this.handlePanelSelect('batter-header')}
                  isOpen={this.state.panelToFocus === 'batter-header'}
                  tabHash={productGroups.productGroupMetaHash.productBatter}
                />
            )}
              expanded={(this.state.panelToFocus === 'batter-header')}
              eventKey="10"
            >
              <div className="row">
                {(this.state.panelToFocus === 'batter-header') && productBatter}
              </div>
            </Panel>
          </div>
          )}

          {productVegetables.length > 0 && (
          <div id="veg-header">
            <Panel
              header={(
                <DisplayCategoryHeader
                  clName="vegetables_bk_ph"
                  title={constants.ProductTypeName.Vegetables.display_name} // "Vegetables"
                  onclick={() => this.handlePanelSelect('veg-header')}
                  isOpen={this.state.panelToFocus === 'veg-header'}
                  tabHash={productGroups.productGroupMetaHash.productVegetables}
                />
              )}
              expanded={(this.state.panelToFocus === 'veg-header')}
              eventKey="3"
            >
              <div className="row">
                {(this.state.panelToFocus === 'veg-header') && productVegetables}
              </div>
            </Panel>
          </div>
          )}

          {productFruits.length > 0 && (
          <div id="fruits-header">
            <Panel
              header={(
                <DisplayCategoryHeader
                  clName="fruits_bk_ph"
                  title={constants.ProductTypeName.Fruits.display_name} // "Fruits"
                  onclick={() => this.handlePanelSelect('fruits-header')}
                  isOpen={this.state.panelToFocus === 'fruits-header'}
                  tabHash={productGroups.productGroupMetaHash.productFruits}
                />
)}
              expanded={(this.state.panelToFocus === 'fruits-header')}
              eventKey="4"
            >
              <div className="row">
                {(this.state.panelToFocus === 'fruits-header') && productFruits}
              </div>
            </Panel>
          </div>
          )}

          {productSpices.length > 0 && (
          <div id="spices-header">
            <Panel
              header={(
                <DisplayCategoryHeader
                  clName="spices_bk_ph"
                  title={constants.ProductTypeName.Spices.display_name} // "Spices & Nuts"
                  onclick={() => this.handlePanelSelect('spices-header')}
                  isOpen={this.state.panelToFocus === 'spices-header'}
                  tabHash={productGroups.productGroupMetaHash.productSpices}
                />
)}
              expanded={(this.state.panelToFocus === 'spices-header')}
              eventKey="7"
            >
              <div className="row">
                {(this.state.panelToFocus === 'spices-header') && productSpices}
              </div>
            </Panel>
          </div>
          )}

          {productOils.length > 0 && (
          <div id="oils-header">
            <Panel
              header={(
                <DisplayCategoryHeader
                  clName="oils_bk_ph"
                  title={constants.ProductTypeName.Oils.display_name} // "Oils, Butter & Ghee"
                  onclick={() => this.handlePanelSelect('oils-header')}
                  isOpen={this.state.panelToFocus === 'oils-header'}
                  tabHash={productGroups.productGroupMetaHash.productOils}
                />
)}
              expanded={(this.state.panelToFocus === 'oils-header')}
              eventKey="8"
            >
              <div className="row">
                {(this.state.panelToFocus === 'oils-header') && productOils}
              </div>
            </Panel>
          </div>
          )}

          {productSweetners.length > 0 && (
          <div id="swt-header">
            <Panel
              header={(
                <DisplayCategoryHeader
                  clName="swt_bk_ph"
                  title={constants.ProductTypeName.Sweetners.display_name} // "Sweetners"
                  onclick={() => this.handlePanelSelect('swt-header')}
                  isOpen={this.state.panelToFocus === 'swt-header'}
                  tabHash={productGroups.productGroupMetaHash.productSweetners}
                />
)}
              expanded={(this.state.panelToFocus === 'swt-header')}
              eventKey="10"
            >
              <div className="row">
                {(this.state.panelToFocus === 'swt-header') && productSweetners}
              </div>
            </Panel>
          </div>
          )}

          {productSnacks.length > 0 && (
          <div id="snacks-header">
            <Panel
              header={(
                <DisplayCategoryHeader
                  clName="snack_bk_ph"
                  title={constants.ProductTypeName.Snacks.display_name} // "Snacks"
                  onclick={() => this.handlePanelSelect('snacks-header')}
                  isOpen={this.state.panelToFocus === 'snacks-header'}
                  tabHash={productGroups.productGroupMetaHash.productSnacks}
                />
          )}
              expanded={(this.state.panelToFocus === 'snacks-header')}
              eventKey="10"
            >
              <div className="row">
                {(this.state.panelToFocus === 'snacks-header') && productSnacks}
              </div>
            </Panel>
          </div>
          )}

          {productPrepared.length > 0 && (
          <div id="prepared-header">
            <Panel
              header={(
                <DisplayCategoryHeader
                  clName="prepared_bk_ph"
                  title={constants.ProductTypeName.Prepared.display_name} // "Pickles & Podis"
                  onclick={() => this.handlePanelSelect('prepared-header')}
                  isOpen={this.state.panelToFocus === 'prepared-header'}
                  tabHash={productGroups.productGroupMetaHash.productPrepared}
                />
)}
              expanded={(this.state.panelToFocus === 'prepared-header')}
              eventKey="9"
            >
              <div className="row">
                {(this.state.panelToFocus === 'prepared-header') && productPrepared}
              </div>
            </Panel>
          </div>
          )}

          {productHygiene.length > 0 && (
          <div id="hyg-header">
            <Panel
              header={(
                <DisplayCategoryHeader
                  clName="hyg_bk_ph"
                  title={constants.ProductTypeName.Hygiene.display_name} // "Personal & General Hygiene"
                  onclick={() => this.handlePanelSelect('hyg-header')}
                  isOpen={this.state.panelToFocus === 'hyg-header'}
                  tabHash={productGroups.productGroupMetaHash.productHygiene}
                />
)}
              expanded={(this.state.panelToFocus === 'hyg-header')}
              eventKey="10"
            >
              <div className="row">
                {(this.state.panelToFocus === 'hyg-header') && productHygiene}
              </div>
            </Panel>
          </div>
          )}

        </PanelGroup>
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

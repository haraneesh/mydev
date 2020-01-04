import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import { PanelGroup } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
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
        Bert.alert(error.reason, 'danger');
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
    const productGroups = this.props.productGroups;


    return this.displayProductsByTypeStandardView(
        productGroups[0],
        productGroups[1],
        productGroups[2],
        productGroups[3],
        productGroups[4],
        productGroups[5],
        productGroups[6],
        productGroups[7],
        productGroups[8],
        productGroups[9],
        );
  }

  displayProductsByTypeStandardView(
    productVegetables,
    productFruits,
    productDhals,
    productGrains,
    productSpices,
    productOils,
    productPrepared,
    productHygiene,
    productSpecials,
    productRecommended) {
    // const expanded = this.state.panelToFocus !== '';
    return (
      <div className="productOrderList">
        {(<PanelGroup activeKey={this.state.activePanel} id="accordion">
          {productRecommended.length > 0 && (<div id="fav-header">
            <Panel
              header={(<DisplayCategoryHeader
                clName="recommended_bk_ph"
                title="My Favourites"
                onclick={() => this.handlePanelSelect('fav-header')}
                isOpen={this.state.panelToFocus === 'fav-header'}
              />)}
              expanded={(this.state.panelToFocus === 'fav-header')}
            >
              { (this.state.panelToFocus === 'fav-header') && productRecommended }
            </Panel>
          </div>
          )
          }

          {productSpecials.length > 0 && (
            <div id="spcl-header">
              <Panel
                className="stickyHeader"
                header={(<DisplayCategoryHeader
                  clName="specials_bk_ph"
                  title="Specials"
                  isOpen={this.state.panelToFocus === 'spcl-header'}
                  onclick={() => this.handlePanelSelect('spcl-header')}
                />)}
                expanded={(this.state.panelToFocus === 'spcl-header')}
              >
                { (this.state.panelToFocus === 'spcl-header') && productSpecials }
              </Panel>
            </div>)
          }

          <div id="veg-header" >
            <Panel
              header={(<DisplayCategoryHeader
                clName="vegetables_bk_ph"
                title="Vegetables"
                onclick={() => this.handlePanelSelect('veg-header')}
                isOpen={this.state.panelToFocus === 'veg-header'}
              />)}
              expanded={(this.state.panelToFocus === 'veg-header')}
              eventKey="3"
            >
              { (this.state.panelToFocus === 'veg-header') && productVegetables }
            </Panel>
          </div>

          <div id="fruits-header">
            <Panel
              header={(<DisplayCategoryHeader
                clName="fruits_bk_ph"
                title="Fruits"
                onclick={() => this.handlePanelSelect('fruits-header')}
                isOpen={this.state.panelToFocus === 'fruits-header'}
              />)}
              expanded={(this.state.panelToFocus === 'fruits-header')}
              eventKey="4"
            >
              { (this.state.panelToFocus === 'fruits-header') && productFruits }
            </Panel>
          </div>

          <div id="grain-header">
            <Panel
              id="grain-header"
              header={(<DisplayCategoryHeader
                clName="grains_bk_ph"
                title="Grains & Flour"
                onclick={() => this.handlePanelSelect('grain-header')}
                isOpen={this.state.panelToFocus === 'grain-header'}
              />)}
              expanded={(this.state.panelToFocus === 'grain-header')}
              eventKey="5"
            >
              {(this.state.panelToFocus === 'grain-header') && productGrains}
            </Panel>
          </div>

          <div id="dhals-header">
            <Panel
              header={(<DisplayCategoryHeader
                clName="dhals_bk_ph"
                title="Pulses, Lentils & Dried Beans"
                onclick={() => this.handlePanelSelect('dhals-header')}
                isOpen={this.state.panelToFocus === 'dhals-header'}
              />)}
              expanded={(this.state.panelToFocus === 'dhals-header')}
              eventKey="6"
            >
              {(this.state.panelToFocus === 'dhals-header') && productDhals}
            </Panel>
          </div>

          <div id="spices-header">
            <Panel
              header={(<DisplayCategoryHeader
                clName="spices_bk_ph"
                title="Spices & Nuts"
                onclick={() => this.handlePanelSelect('spices-header')}
                isOpen={this.state.panelToFocus === 'spices-header'}
              />)}
              expanded={(this.state.panelToFocus === 'spices-header')}
              eventKey="7"
            >
              {(this.state.panelToFocus === 'spices-header') && productSpices}
            </Panel>
          </div>

          <div id="oils-header">
            <Panel
              header={(<DisplayCategoryHeader
                clName="oils_bk_ph"
                title="Oils, Butter & Ghee"
                onclick={() => this.handlePanelSelect('oils-header')}
                isOpen={this.state.panelToFocus === 'oils-header'}
              />)}
              expanded={(this.state.panelToFocus === 'oils-header')}
              eventKey="8"
            >
              {(this.state.panelToFocus === 'oils-header') && productOils}
            </Panel>
          </div>

          <div id="prepared-header">
            <Panel
              header={(<DisplayCategoryHeader
                clName="prepared_bk_ph"
                title="Pickles & Podis"
                onclick={() => this.handlePanelSelect('prepared-header')}
                isOpen={this.state.panelToFocus === 'prepared-header'}
              />)}
              expanded={(this.state.panelToFocus === 'prepared-header')}
              eventKey="9"
            >
              {(this.state.panelToFocus === 'prepared-header') && productPrepared}
            </Panel>
          </div>

          <div id="hyg-header">
            <Panel
              header={(<DisplayCategoryHeader
                clName="hyg_bk_ph"
                title="Personal & General Hygiene"
                onclick={() => this.handlePanelSelect('hyg-header')}
                isOpen={this.state.panelToFocus === 'hyg-header'}
              />)}
              expanded={(this.state.panelToFocus === 'hyg-header')}
              eventKey="10"
            >
              {(this.state.panelToFocus === 'hyg-header') && productHygiene}
            </Panel>
          </div>
        </PanelGroup>)}

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

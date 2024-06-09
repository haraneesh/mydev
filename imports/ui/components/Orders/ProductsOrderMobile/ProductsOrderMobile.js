import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import Accordion from 'react-bootstrap/Accordion';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { toast } from 'react-toastify';
import constants from '../../../../modules/constants';
import { DisplayCategoryHeader, SideBarDisplayHeader } from '../ProductsOrderCommon/ProductsOrderCommon';
import { isChennaiPinCode } from '../../../../modules/helpers';

import './ProductsOrderMobile.scss';

export default class ProductsOrderMobile extends React.Component {
  constructor(props, context) {
    super(props, context);

    const totalBillAmount = (props.totalBillAmount) ? props.totalBillAmount : 0;

    this.state = {
      products: this.props.productsArray,
      totalBillAmount,
      panelToFocus: 'order-tab', // ''
      recommendations: this.props.recommendations,
      // recommendations: [], // do not show recommendations,
      scrollToLocation: false,
    };

    this.handlePanelSelect = this.handlePanelSelect.bind(this);
    this.returnSideBarNavLink = this.returnSideBarNavLink.bind(this);
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
    document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' });
    { /*
    this.setState({
      panelToFocus: (this.state.panelToFocus === panelToFocus ? '' : panelToFocus),
      scrollToLocation: true,
    }); */ }
  }

  displayProductsByType() {
    const { productGroups } = this.props;
    return this.displayProductsByTypeStandardView(productGroups);
  }

  returnSideBarNavLink({ displayText, imgName, eventKey }) {
    return (
      <Nav.Item>
        <Nav.Link eventKey={eventKey} style={{ padding: 0 }}>
          <SideBarDisplayHeader onclick={() => this.handlePanelSelect('order-tab')} clName="menuIcon" title={displayText} imgName={imgName} />
        </Nav.Link>
      </Nav.Item>
    );
  }

  displayProductsByTypeStandardView(productGroups) {
    const {
      productVegetables,
      productFruits,
      productGreens,
      productRice,
      productWheat,
      productCereals,
      productMillets,
      productDhals,
      productSweetners,
      productSalts,
      productSpices,
      productNuts,
      productDryFruits,
      productOils,
      productMilk,
      productEggs,
      productPrepared,
      productDisposables,
      productBeauty,
      productSpecials,
    } = productGroups;

    const productRecommended = [];

    const isDeliveryInChennai = isChennaiPinCode(this.props.deliveryPincode);

    // const expanded = this.state.panelToFocus !== '';
    return (
      <div className="productOrderList" id="order-tab">
        {/* side navigation */}
        <Tab.Container id="order-tabb" defaultActiveKey="specials">
          <Row style={{
            alignItems: 'flex-start',
          }}
          >
            <Col
              xs={3}
              className="menuLeft sticky-top pe-0 pb-5 border-end border-light m-0"
            >
              <Nav variant="pills" className="flex-column">
                { (this.returnSideBarNavLink({ displayText: 'New Arrivals', imgName: 'imgSpecials', eventKey: 'specials' }))}
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.Vegetables.display_value, imgName: 'imgVegetables', eventKey: 'vegetables' })) }
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.Fruits.display_value, imgName: 'imgFruits', eventKey: 'fruits' })) }
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.Greens.display_value, imgName: 'imgGreens', eventKey: 'greens' })) }
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.Rice.display_value, imgName: 'imgRice', eventKey: 'rice' })) }
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.Wheat.display_value, imgName: 'imgWheat', eventKey: 'wheat' })) }
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.Cereals.display_value, imgName: 'imgCereals', eventKey: 'cereals' })) }
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.Millets.display_value, imgName: 'imgMillets', eventKey: 'millets' })) }
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.Dhals.display_value, imgName: 'imgDhals', eventKey: 'dhals' })) }
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.Sweetners.display_value, imgName: 'imgSweetners', eventKey: 'sweetners' })) }
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.Salts.display_value, imgName: 'imgSalts', eventKey: 'salts' })) }
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.Spices.display_value, imgName: 'imgSpices', eventKey: 'spices' })) }
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.Nuts.display_value, imgName: 'imgNuts', eventKey: 'nuts' })) }
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.DryFruits.display_value, imgName: 'imgDryFruits', eventKey: 'dryFruits' })) }
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.Oils.display_value, imgName: 'imgOils', eventKey: 'oils' })) }
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.Milk.display_value, imgName: 'imgMilk', eventKey: 'milk' })) }
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.Eggs.display_value, imgName: 'imgEggs', eventKey: 'eggs' })) }
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.Prepared.display_value, imgName: 'imgPrepared', eventKey: 'prepared' })) }
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.Disposables.display_value, imgName: 'imgDisposables', eventKey: 'disposables' })) }
                { (this.returnSideBarNavLink({ displayText: constants.ProductTypeName.Beauty.display_value, imgName: 'imgBeauty', eventKey: 'beauty' })) }
              </Nav>
            </Col>
            <Col>
              <Tab.Content className="mx-auto">
                <Tab.Pane eventKey="specials"><Row>{productSpecials}</Row></Tab.Pane>
                <Tab.Pane eventKey="vegetables"><Row>{productVegetables}</Row></Tab.Pane>
                <Tab.Pane eventKey="fruits"><Row>{productFruits}</Row></Tab.Pane>
                <Tab.Pane eventKey="greens"><Row>{productGreens}</Row></Tab.Pane>
                <Tab.Pane eventKey="rice"><Row>{productRice}</Row></Tab.Pane>
                <Tab.Pane eventKey="wheat"><Row>{productWheat}</Row></Tab.Pane>
                <Tab.Pane eventKey="cereals"><Row>{productCereals}</Row></Tab.Pane>
                <Tab.Pane eventKey="millets"><Row>{productMillets}</Row></Tab.Pane>
                <Tab.Pane eventKey="dhals"><Row>{productDhals}</Row></Tab.Pane>
                <Tab.Pane eventKey="sweetners"><Row>{productSweetners}</Row></Tab.Pane>
                <Tab.Pane eventKey="salts"><Row>{productSalts}</Row></Tab.Pane>
                <Tab.Pane eventKey="spices"><Row>{productSpices}</Row></Tab.Pane>
                <Tab.Pane eventKey="nuts"><Row>{productNuts}</Row></Tab.Pane>
                <Tab.Pane eventKey="dryFruits"><Row>{productDryFruits}</Row></Tab.Pane>
                <Tab.Pane eventKey="oils"><Row>{productOils}</Row></Tab.Pane>
                <Tab.Pane eventKey="milk"><Row>{productMilk}</Row></Tab.Pane>
                <Tab.Pane eventKey="eggs"><Row>{productEggs}</Row></Tab.Pane>
                <Tab.Pane eventKey="prepared"><Row>{productPrepared}</Row></Tab.Pane>
                <Tab.Pane eventKey="disposables"><Row>{productDisposables}</Row></Tab.Pane>
                <Tab.Pane eventKey="beauty"><Row>{productBeauty}</Row></Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
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

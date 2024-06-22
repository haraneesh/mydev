import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { toast } from 'react-toastify';
import constants from '../../../../modules/constants';
import Product from '../Product';
import { DisplayCategoryHeader, SideBarDisplayHeader } from '../ProductsOrderCommon/ProductsOrderCommon';
import { isChennaiPinCode, toTitleCase } from '../../../../modules/helpers';

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
    this.displayProductsWithCategories = this.displayProductsWithCategories.bind(this);
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

  displayProductsWithCategories(productArray, preFix) {
    if (!productArray || productArray.length === 0) {
      return (<Row><h4>Today, We don't have products in this category.</h4></Row>);
    }

    const productsBySubCategory = {};

    productArray.forEach((item) => {
      const p = item.product;
      const subCategory = (p.category) ? toTitleCase(p.category) : 'Others';
      if (!productsBySubCategory[subCategory]) {
        productsBySubCategory[subCategory] = [];
      }
      productsBySubCategory[subCategory].push(
        <Product
          isMobile={item.isMobile}
          key={item.key}
          updateProductQuantity={item.updateProductQuantity}
          product={item.product}
          isAdmin={item.isAdmin || item.isShopOwner}
          checkout={item.checkout}
          isBasket={item.isBasket}
        />,
      );
    });

    const productDisplayList = [];
    const subCategorys = Object.keys(productsBySubCategory).sort();
    const catRow = [];
    subCategorys.forEach((key) => {
      catRow.push(
        <Nav.Item>
          <Nav.Link
            event={key}
            onClick={() => {
              const cardHeaderToMove = document.getElementById(`${preFix}-${key}`);
              const stickyNavBar = document.getElementById(`${preFix}-cat-row`);
              const targetPosition = cardHeaderToMove.getBoundingClientRect().top + window.scrollY;
              window.scrollTo({ top: targetPosition - stickyNavBar.offsetHeight, behavior: 'smooth' });
            }}
          >
            {key}
          </Nav.Link>
        </Nav.Item>,
      );
    });

    productDisplayList.push(<Nav variant="pills bg-white border-bottom border-2 border-light border-opacity-50" className="sticky-top" id={`${preFix}-cat-row`}>{catRow}</Nav>);

    subCategorys.forEach((key) => {
      const displayText = (constants.ProductTypeName[key])
        ? constants.ProductTypeName[key].display_value
        : key;

      productDisplayList.push(
        <Row key={key} id={`${preFix}-${key}`}>
          <div className="card-header text-start" style={{ borderRadius: '4px', fontWeight: 'bold' }}>
            <h6>{displayText}</h6>
          </div>
          {productsBySubCategory[key]}
        </Row>,
      );
    });

    return (<>{productDisplayList}</>);
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

              <Nav variant="pills" style={{ flexFlow: 'column' }}>
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
              <Tab.Content>
                <Tab.Pane eventKey="specials"><Row>{this.displayProductsWithCategories(productSpecials, 'specials')}</Row></Tab.Pane>
                <Tab.Pane eventKey="vegetables"><Row>{this.displayProductsWithCategories(productVegetables, 'vegetables')}</Row></Tab.Pane>
                <Tab.Pane eventKey="fruits"><Row>{this.displayProductsWithCategories(productFruits, 'fruits')}</Row></Tab.Pane>
                <Tab.Pane eventKey="greens"><Row>{this.displayProductsWithCategories(productGreens, 'greens')}</Row></Tab.Pane>
                <Tab.Pane eventKey="rice">{this.displayProductsWithCategories(productRice, 'rice')}</Tab.Pane>
                <Tab.Pane eventKey="wheat"><Row>{this.displayProductsWithCategories(productWheat, 'wheat')}</Row></Tab.Pane>
                <Tab.Pane eventKey="cereals"><Row>{this.displayProductsWithCategories(productCereals, 'cereals')}</Row></Tab.Pane>
                <Tab.Pane eventKey="millets"><Row>{this.displayProductsWithCategories(productMillets, 'millets')}</Row></Tab.Pane>
                <Tab.Pane eventKey="dhals"><Row>{this.displayProductsWithCategories(productDhals, 'dhals')}</Row></Tab.Pane>
                <Tab.Pane eventKey="sweetners"><Row>{this.displayProductsWithCategories(productSweetners, 'sweetners')}</Row></Tab.Pane>
                <Tab.Pane eventKey="salts"><Row>{this.displayProductsWithCategories(productSalts, 'salts')}</Row></Tab.Pane>
                <Tab.Pane eventKey="spices"><Row>{this.displayProductsWithCategories(productSpices, 'spices')}</Row></Tab.Pane>
                <Tab.Pane eventKey="nuts"><Row>{this.displayProductsWithCategories(productNuts, 'nuts')}</Row></Tab.Pane>
                <Tab.Pane eventKey="dryFruits"><Row>{this.displayProductsWithCategories(productDryFruits, 'dryFruits')}</Row></Tab.Pane>
                <Tab.Pane eventKey="oils"><Row>{this.displayProductsWithCategories(productOils, 'oils')}</Row></Tab.Pane>
                <Tab.Pane eventKey="milk"><Row>{this.displayProductsWithCategories(productMilk, 'milk')}</Row></Tab.Pane>
                <Tab.Pane eventKey="eggs"><Row>{this.displayProductsWithCategories(productEggs, 'eggs')}</Row></Tab.Pane>
                <Tab.Pane eventKey="prepared"><Row>{this.displayProductsWithCategories(productPrepared, 'prepared')}</Row></Tab.Pane>
                <Tab.Pane eventKey="disposables"><Row>{this.displayProductsWithCategories(productDisposables, 'disposables')}</Row></Tab.Pane>
                <Tab.Pane eventKey="beauty"><Row>{this.displayProductsWithCategories(productBeauty, 'beauty')}</Row></Tab.Pane>
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

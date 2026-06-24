import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import React from 'react';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import { toast } from 'react-toastify';
import constants from '../../../../modules/constants';
import { toTitleCase } from '../../../../modules/helpers';
import Product from '../Product';
import {
  SideBarDisplayHeader,
  getDefaultOrderProductCategoryKey,
  getVisibleOrderProductCategories,
} from '../ProductsOrderCommon/ProductsOrderCommon';
import SubCategoryRow from '../SubCategoryRow/SubCategoryRow';

import './ProductsOrderMobile.scss';

export default class ProductsOrderMobile extends React.Component {
  constructor(props, context) {
    super(props, context);

    const totalBillAmount = props.totalBillAmount ? props.totalBillAmount : 0;

    this.state = {
      products: this.props.productsArray,
      totalBillAmount,
      panelToFocus: 'order-tab', // ''
      recommendations: this.props.recommendations
        ? this.props.recommendations
        : [],
      scrollToLocation: false,
      routedCategoryKey: '',
    };

    this.handlePanelSelect = this.handlePanelSelect.bind(this);
    this.returnSideBarNavLink = this.returnSideBarNavLink.bind(this);
    this.getVisibleCategories = this.getVisibleCategories.bind(this);
    this.isCategoryVisible = this.isCategoryVisible.bind(this);
    this.displayProductsWithCategories =
      this.displayProductsWithCategories.bind(this);
    this.displayProductsByTypeStandardView =
      this.displayProductsByTypeStandardView.bind(this);
  }

  componentDidMount() {
    if (Meteor.userId()) {
      Meteor.call('users.visitedPlaceNewOrder', (error) => {
        if (error && Meteor.isDevelopment) {
          toast.error(error.reason);
        }
      });
    }

    const preFix = this.props.category;
    const key = this.props.subCategory;
    this.goToCategoryAndSubCategory(preFix, key);
  }

  componentDidUpdate(prevProps) {
    const categoryKeysChanged =
      getVisibleOrderProductCategories(prevProps.productGroups)
        .map(({ eventKey }) => eventKey)
        .join('|') !==
      this.getVisibleCategories()
        .map(({ eventKey }) => eventKey)
        .join('|');

    if (
      this.props.category &&
      categoryKeysChanged &&
      this.state.routedCategoryKey !== this.props.category
    ) {
      this.goToCategoryAndSubCategory(
        this.props.category,
        this.props.subCategory,
      );
    }

    if (this.state.scrollToLocation) {
      if (this.state.panelToFocus) {
        setTimeout(
          (toFocus) => {
            document
              .getElementById(toFocus)
              .scrollIntoView({ behavior: 'smooth' });
          },
          150,
          this.state.panelToFocus,
        );
      }
      this.setState({
        scrollToLocation: false,
      });
    }
  }

  goToCategoryAndSubCategory(preFix, key) {
    if (preFix && this.isCategoryVisible(preFix)) {
      this.setState({ routedCategoryKey: preFix });
      const section = document.getElementById(`order-tabb-tab-${preFix}`);
      if (!section) return;
      section.click();
      // If category and subcategory are set then roll to that section
      setTimeout(() => {
        const cardHeaderToMove = document.getElementById(`${preFix}-${key}`);
        const stickyNavBar = document.getElementById(`${preFix}-cat-row`);
        if (cardHeaderToMove && stickyNavBar) {
          const targetPosition =
            cardHeaderToMove.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: targetPosition - stickyNavBar.offsetHeight,
            behavior: 'smooth',
          });
        }
      });
    }
  }

  handlePanelSelect(_panelToFocus) {
    document
      .getElementById('search-section')
      .scrollIntoView({ behavior: 'smooth' });
  }

  displayProductsByType() {
    const { productGroups } = this.props;
    return this.displayProductsByTypeStandardView(productGroups);
  }

  getVisibleCategories(productGroups = this.props.productGroups) {
    return getVisibleOrderProductCategories(productGroups);
  }

  isCategoryVisible(eventKey) {
    return this.getVisibleCategories().some(
      (category) => category.eventKey === eventKey,
    );
  }

  returnSideBarNavLink({ displayText, imgName, eventKey }) {
    const isHealthCategory =
      eventKey === constants.ProductCuratedCategory.proteinRich.name ||
      eventKey === constants.ProductCuratedCategory.gutHealth.name;

    return (
      <Nav.Item
        className={isHealthCategory ? 'healthCategoryNavItem' : ''}
        key={eventKey}
      >
        <Nav.Link
          eventKey={eventKey}
          className={isHealthCategory ? 'healthCategoryNavLink' : ''}
          style={{ padding: 0 }}
        >
          <SideBarDisplayHeader
            onclick={() => this.handlePanelSelect('order-tab')}
            clName={
              isHealthCategory ? 'menuIcon healthCategoryHeader' : 'menuIcon'
            }
            title={displayText}
            imgName={imgName}
          />
        </Nav.Link>
      </Nav.Item>
    );
  }

  displayProductsWithCategories(productArray, preFix) {
    if (!productArray || productArray.length === 0) {
      return (
        <Row>
          <h4>Today, We don't have products in this category.</h4>
        </Row>
      );
    }

    const productsBySubCategory = {};

    productArray.forEach((item) => {
      const p = item.product;
      const subCategory = p.category ? toTitleCase(p.category) : 'Others';
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
    const subCatRowItems = [];
    subCategorys.forEach((key) => {
      subCatRowItems.push({
        key,
        label: key,
        onClick: () => {
          const cardHeaderToMove = document.getElementById(
            `${preFix}-${key.replace(' ', '').toLowerCase()}`,
          );
          const stickyNavBar = document.getElementById(`${preFix}-cat-row`);
          if (!cardHeaderToMove || !stickyNavBar) {
            return;
          }
          const targetPosition =
            cardHeaderToMove.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: targetPosition - stickyNavBar.offsetHeight,
            behavior: 'smooth',
          });
        },
      });
    });

    const subCatRowId = `${preFix}-cat-row`;
    productDisplayList.push(
      <Nav
        key={subCatRowId}
        variant="pills"
        className="sticky-top productSubCategoryNav"
        id={subCatRowId}
      >
        <SubCategoryRow items={subCatRowItems} />
      </Nav>,
    );

    subCategorys.forEach((key) => {
      const displayText = constants.ProductTypeName[key]
        ? constants.ProductTypeName[key].display_value
        : key;

      productDisplayList.push(
        <Row
          key={key}
          className="productSubCategorySection"
          id={`${preFix}-${key.replace(' ', '').toLowerCase()}`}
        >
          <div className="productSubCategoryHeader text-start">
            <h6>{displayText}</h6>
          </div>
          {productsBySubCategory[key]}
        </Row>,
      );
    });

    return <>{productDisplayList}</>;
  }

  displayProductsByTypeStandardView(productGroups) {
    const visibleCategories = this.getVisibleCategories(productGroups);
    const defaultActiveKey = getDefaultOrderProductCategoryKey(
      productGroups,
      Meteor.settings.public.PRODUCT_ORDER.PAGE_TO_OPEN_DEFAULT,
    );

    // const expanded = this.state.panelToFocus !== '';
    if (visibleCategories.length === 0) {
      return (
        <div className="productOrderList" id="order-tab">
          <Row>
            <Col xs={12} className="productOrderEmptyState">
              <h4>Today, We don't have products available.</h4>
            </Col>
          </Row>
        </div>
      );
    }

    return (
      <div className="productOrderList" id="order-tab">
        {/* side navigation */}
        <Tab.Container id="order-tabb" defaultActiveKey={defaultActiveKey}>
          <Row
            style={{
              alignItems: 'flex-start',
            }}
          >
            <Col
              xs={3}
              className="menuLeft sticky-top pe-0 pb-5 border-end border-light m-0"
            >
              <Nav variant="pills" style={{ flexFlow: 'column' }}>
                {visibleCategories.map((category) =>
                  this.returnSideBarNavLink(category),
                )}
              </Nav>
            </Col>
            <Col xs={9} className="productOrderPanels">
              <Tab.Content className="productOrderPanelsContent">
                {visibleCategories.map((category) => (
                  <Tab.Pane
                    eventKey={category.eventKey}
                    key={category.eventKey}
                  >
                    <Row>
                      {this.displayProductsWithCategories(
                        productGroups[category.groupKey],
                        category.eventKey,
                      )}
                    </Row>
                  </Tab.Pane>
                ))}
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    );
  }

  render() {
    return this.displayProductsByType(this.state.products);
  }
}

ProductsOrderMobile.propTypes = {
  productGroups: PropTypes.object.isRequired,
  productsArray: PropTypes.object.isRequired,
  productGroupSelected: PropTypes.number,
  recommendations: PropTypes.array,
  orderId: PropTypes.string,
  orderStatus: PropTypes.string,
  comments: PropTypes.string,
  totalBillAmount: PropTypes.number,
  dateValue: PropTypes.object,
};

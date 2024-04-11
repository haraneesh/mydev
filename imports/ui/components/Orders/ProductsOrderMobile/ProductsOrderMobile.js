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
      <div className="productOrderList" id="order-tab">
        {/* side navigation */}
        <Tab.Container id="order-tabb" defaultActiveKey="specials">
          <Row style={{
            alignItems: 'flex-start',
          }}
          >
            <Col
              xs={3}
              sm={2}
              style={{
                borderColor: '#f1edf3',
                boxShadow: '0px 0px 8px rgba(0,0,0,.08)',
              }}
              className="menuLeft sticky-top pb-5"
            >
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="specials" style={{ padding: 0 }}>
                    <SideBarDisplayHeader onclick={() => this.handlePanelSelect('order-tab')} clName="specials_bk_ph" title="New Arrivals" />
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="grains" style={{ padding: 0 }}>
                    <SideBarDisplayHeader onclick={() => this.handlePanelSelect('order-tab')} clName="grains_bk_ph" title={constants.ProductTypeName.Grains.display_name} />
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="flours" style={{ padding: 0 }}>
                    <SideBarDisplayHeader onclick={() => this.handlePanelSelect('order-tab')} clName="flours_bk_ph" title={constants.ProductTypeName.Flours.display_name} />
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="dhals" style={{ padding: 0 }}>
                    <SideBarDisplayHeader onclick={() => this.handlePanelSelect('order-tab')} clName="dhals_bk_ph" title={constants.ProductTypeName.Dhals.display_name} />
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="batter" style={{ padding: 0 }}>
                    <SideBarDisplayHeader onclick={() => this.handlePanelSelect('order-tab')} clName="batter_bk_ph" title={constants.ProductTypeName.Batter.display_name} />
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="vegetables" style={{ padding: 0 }}>
                    <SideBarDisplayHeader onclick={() => this.handlePanelSelect('order-tab')} clName="vegetables_bk_ph" title={constants.ProductTypeName.Vegetables.display_name} />
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="fruits" style={{ padding: 0 }}>
                    <SideBarDisplayHeader onclick={() => this.handlePanelSelect('order-tab')} clName="fruits_bk_ph" title={constants.ProductTypeName.Fruits.display_name} />
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="spices" style={{ padding: 0 }}>
                    <SideBarDisplayHeader onclick={() => this.handlePanelSelect('order-tab')} clName="spices_bk_ph" title={constants.ProductTypeName.Spices.display_name} />
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="oils" style={{ padding: 0 }}>
                    <SideBarDisplayHeader onclick={() => this.handlePanelSelect('order-tab')} clName="oils_bk_ph" title={constants.ProductTypeName.Oils.display_name} />
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="sweetners" style={{ padding: 0 }}>
                    <SideBarDisplayHeader onclick={() => this.handlePanelSelect('order-tab')} clName="swt_bk_ph" title={constants.ProductTypeName.Sweetners.display_name} />
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="snack" style={{ padding: 0 }}>
                    <SideBarDisplayHeader onclick={() => this.handlePanelSelect('order-tab')} clName="snack_bk_ph" title={constants.ProductTypeName.Snacks.display_name} />
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="prepared" style={{ padding: 0 }}>
                    <SideBarDisplayHeader onclick={() => this.handlePanelSelect('order-tab')} clName="prepared_bk_ph" title={constants.ProductTypeName.Prepared.display_name} />
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="hygiene" style={{ padding: 0 }}>
                    <SideBarDisplayHeader onclick={() => this.handlePanelSelect('order-tab')} clName="hyg_bk_ph" title={constants.ProductTypeName.Hygiene.display_name} />
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            <Col>
              <Tab.Content className="mx-auto">
                <Tab.Pane eventKey="specials"><Row>{productSpecials}</Row></Tab.Pane>
                <Tab.Pane eventKey="grains"><Row>{productGrains}</Row></Tab.Pane>
                <Tab.Pane eventKey="flours"><Row>{productFlours}</Row></Tab.Pane>
                <Tab.Pane eventKey="dhals"><Row>{productDhals}</Row></Tab.Pane>
                <Tab.Pane eventKey="batter"><Row>{productBatter}</Row></Tab.Pane>
                <Tab.Pane eventKey="vegetables"><Row>{productVegetables}</Row></Tab.Pane>
                <Tab.Pane eventKey="fruits"><Row>{productFruits}</Row></Tab.Pane>
                <Tab.Pane eventKey="spices"><Row>{productSpices}</Row></Tab.Pane>
                <Tab.Pane eventKey="oils"><Row>{productOils}</Row></Tab.Pane>
                <Tab.Pane eventKey="sweetners"><Row>{productSweetners}</Row></Tab.Pane>
                <Tab.Pane eventKey="snack"><Row>{productSnacks}</Row></Tab.Pane>
                <Tab.Pane eventKey="prepared"><Row>{productPrepared}</Row></Tab.Pane>
                <Tab.Pane eventKey="hygiene"><Row>{productHygiene}</Row></Tab.Pane>
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

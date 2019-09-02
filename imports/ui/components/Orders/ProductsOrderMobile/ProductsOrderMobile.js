import React from 'react';
import {Meteor} from 'meteor/meteor';
import PropTypes from 'prop-types';
import { ListGroup, Row, Col, Panel } from 'react-bootstrap';
import { PanelGroup } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import { DisplayCategoryHeader } from '../ProductsOrderCommon/ProductsOrderCommon';

import './ProductsOrderMobile.scss';

export default class ProductsOrderMobile extends React.Component {
  constructor(props, context) {
    super(props, context);

    const totalBillAmount = (props.totalBillAmount) ? props.totalBillAmount : 0;

    this.state = {
      products: this.props.productArray,
      totalBillAmount,
      panelToFocus: "",
      recommendations: props.recommendations,
      //recommendations: [], // do not show recommendations,
      scrollToLocation: false,
    };

    this.handlePanelSelect = this.handlePanelSelect.bind(this);
    this.displayProductsByTypeStandardView = this.displayProductsByTypeStandardView.bind(this);
  }

  componentDidMount() {
    Meteor.call('users.visitedPlaceNewOrder',(error) => {
      if (error && Meteor.isDevelopment) {
        Bert.alert(error.reason, 'danger');
      } 
    });
  }

  componentDidUpdate(){
    if (this.state.scrollToLocation){
      if (this.state.panelToFocus){
        document.getElementById(this.state.panelToFocus).scrollIntoView(true); 
      }
      this.setState({
        scrollToLocation: false,
    });
   }
  }

  handlePanelSelect(panelToFocus) {
    this.setState({
      panelToFocus: (this.state.panelToFocus === ""? panelToFocus: ""),
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
        );
  }

  displayProductsByTypeStandardView(
    productGroceries, 
    productVegetables, 
    productBatters, 
    productPersonalHygiene, 
    productSpecials, 
    productRecommended,){

    const expanded = this.state.panelToFocus !== "";
    return (
      <div className="productOrderList">
        { (<PanelGroup activeKey={this.state.activePanel} id="accordion">
          {productRecommended.length > 0 && (<div id="fav-header">
            <Panel
              header={(<DisplayCategoryHeader
              clName="recommended_bk_ph"
              title="My Favourites"
              onclick={() => this.handlePanelSelect('fav-header')}
              isOpen={this.state.panelToFocus !== ""}
              />)}
              expanded={expanded}
          >
            { expanded && productRecommended }
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
                isOpen={this.state.panelToFocus !== ""}
                onclick={() => this.handlePanelSelect('spcl-header')}
                />)}
                expanded={expanded}
              >
                { expanded && productSpecials }
            </Panel>
          </div>)
          }

          <div id="groc-header" >
            <Panel 
              header={(<DisplayCategoryHeader 
              clName="groceries_bk_ph" 
              title="Groceries" 
              onclick={() => this.handlePanelSelect('groc-header')} 
              isOpen={this.state.panelToFocus !== ""} />)} 
              expanded={expanded} eventKey="3" >
              { expanded && productGroceries }
            </Panel>
          </div>

          <div id="veg-header">
            <Panel 
              header={(<DisplayCategoryHeader 
              clName="vegetables_bk_ph" 
              title="Vegetables & Fruit" 
              onclick={() => this.handlePanelSelect('veg-header')} 
              isOpen={this.state.panelToFocus !== ""} />)} 
              expanded={expanded} eventKey="4" >
              { expanded && productVegetables }
            </Panel>
            </div>

          <div id="prep-header">
            <Panel 
              id="prep-header"
              header={(<DisplayCategoryHeader 
              clName="prepared_bk_ph" 
              title="Podi, Oil, Batter & Pickles" 
              onclick={() => this.handlePanelSelect('prep-header')} 
              isOpen={this.state.panelToFocus !== ""} />)} 
              expanded={expanded} eventKey="5" >
              {expanded && productBatters}
            </Panel>
          </div>


          {productPersonalHygiene.length > 0 && (
            <div  id="pg-header">
              <Panel  
                header={(<DisplayCategoryHeader 
                clName="pg_bk_ph" 
                title="Personal & General Hygiene" onclick={() => this.handlePanelSelect('pg-header')} 
                isOpen={this.state.panelToFocus !== ""} />)} 
                expanded={expanded} eventKey="6">
                {expanded && productPersonalHygiene}
              </Panel>
          </div>
          )}
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
  productArray: PropTypes.object.isRequired,
  productGroupSelected: PropTypes.number,
  orderId: PropTypes.string,
  orderStatus: PropTypes.string,
  comments: PropTypes.string,
  totalBillAmount: PropTypes.number,
  dateValue: PropTypes.object,
  history: PropTypes.object.isRequired
};

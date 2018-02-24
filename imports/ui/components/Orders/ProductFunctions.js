import React from 'react';

export const calcExcessQtyOrdered = (
  maxUnitsAvailableToOrder,
  totQuantityOrdered,
  previousOrdQty,
  quantitySelected) => {
  if (maxUnitsAvailableToOrder > 0) {
    return (maxUnitsAvailableToOrder - totQuantityOrdered) + (previousOrdQty - quantitySelected);
  }
  return 0;
};

export const InformProductUnavailability = ({
  maxUnitsAvailableToOrder,
  excessQtyOrdered }) => {
  if (maxUnitsAvailableToOrder > 0 && excessQtyOrdered < 0) {
    return (<h4 className="product-name-subtext"><small>
          We have more orders for this item than the quantity we are expecting to get from the farm.
          Please bear with us, We will do our best to fullfill the excess within a day or two. </small></h4>);
  }
  return <span />;
};


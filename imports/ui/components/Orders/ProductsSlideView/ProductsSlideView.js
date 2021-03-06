import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ItemsCarousel from 'react-items-carousel';
import Product from '../Product';
import Icon from '../../Icon/Icon';
import './ProductSlideView.scss';
import { isDeviceMobile } from '../../../../modules/helpers';

// All items component
// Important! add unique key
export const Menu = ({
  menuList, changeProductQuantity, isAdmin, isShopOwner,
}) => menuList.filter((el) => el.props.product).map((el) => (

  <Product
    key={`prdSlideView-${el.props.product._id}`}
    updateProductQuantity={changeProductQuantity}
    product={el.props.product}
    isAdmin={isAdmin}
    isShopOwner={isShopOwner}
    productClass="sliderProduct"
    sliderView
  />

));

const ArrowLeft = (<Icon className="arrow" icon="angle-left" />);
const ArrowRight = (<Icon className="arrow" icon="angle-right" />);

export default function ProductSlideView({
  menuList, changeProductQuantity, isAdmin, isShopOwner,
}) {
  // const [selected, setSelected] = useState('item1');

  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const menuItems = Menu({
    menuList, changeProductQuantity, isAdmin, isShopOwner,
  });

  return (
    <div className="App">

      <ItemsCarousel
        requestToChangeActive={setActiveItemIndex}
        activeItemIndex={activeItemIndex}
        numberOfCards={isDeviceMobile() ? 1 : 2}
        gutter={15}
        leftChevron={ArrowLeft}
        rightChevron={ArrowRight}
        chevronWidth={40}
        alwaysShowChevrons
        showSlither
      >
        {menuItems}
      </ItemsCarousel>
    </div>

  );
}

ProductSlideView.defaultProps = {
  isAdmin: false,
  isShopOwner: false,
};

ProductSlideView.propTypes = {
  menuList: PropTypes.object.isRequired,
  changeProductQuantity: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
  isShopOwner: PropTypes.bool,
};

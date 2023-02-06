import React from 'react';
import PropTypes from 'prop-types';
import Product from '../Product';
import Slider from './Slider';
import './ProductSlideView.scss';

// All items component
// Important! add unique key

/*
    <div className="main-carousel" data-flickity='{ "cellAlign": "left", "contain": true }'>

      {menuItems}

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
*/

export const Menu = ({
  menuList, changeProductQuantity, isAdmin, isShopOwner,
}) => menuList.filter((el) => el.props.product).map((el) => (

  <div className="carousel-cell" style={{ width: '300px', margin: '0 0.5em 0 0' }} key={`carSlideView-${el.props.product._id}`}>
    <Product
      key={`prdSlideView-${el.props.product._id}`}
      updateProductQuantity={changeProductQuantity}
      product={el.props.product}
      isAdmin={isAdmin}
      isShopOwner={isShopOwner}
      productClass="sliderProduct"
      sliderView
    />
  </div>

));

export default function ProductSlideView({
  menuList, changeProductQuantity, isAdmin, isShopOwner,
}) {
  const menuItems = Menu({
    menuList, changeProductQuantity, isAdmin, isShopOwner,
  });

  return (

    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }} />
      <Slider
        options={{
          initialIndex: 0,
          accessibility: true,
          contain: true,
          pageDots: false,
        }}
      >
        {menuItems}
      </Slider>

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

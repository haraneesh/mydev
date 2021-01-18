import React from 'react';
import PropTypes from 'prop-types';
import ScrollMenu from 'react-horizontal-scrolling-menu';
import Product from '../Product';
import Icon from '../../Icon/Icon';
import './ProductSlideView.scss';

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
    productClass="slideProductItem"
  />
));

const ArrowLeft = (<Icon className="arrow" icon="angle-left" />);
const ArrowRight = (<Icon className="arrow" icon="angle-right" />);

export default function ProductSlideView({
  menuList, changeProductQuantity, isAdmin, isShopOwner,
}) {
  // const [selected, setSelected] = useState('item1');
  const menuItems = Menu({
    menuList, changeProductQuantity, isAdmin, isShopOwner,
  });

  return (
    <div className="App">

      <ScrollMenu
        data={menuItems}
        arrowLeft={ArrowLeft}
        arrowRight={ArrowRight}
        // selected={selected}
        // onSelect={onSelect}
        alignCenter
        clickWhenDrag={false}
        dragging
        hideArrows
        hideSingleArrow
        itemsCount={menuItems.length}
        scrollToSelected={false}
        translate="translate3d(0px, 0px, 0px)"
        transition={0.4}
        wheel={false}
        showList
        inertiascrolling={false}
        slowdownFactor={0.25}
        arrowDisabledClass="arrow-disabled"
      />
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

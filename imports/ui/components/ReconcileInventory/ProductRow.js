import React from 'react';
import PropTypes from 'prop-types';
import FieldGroup from '../Common/FieldGroup';

const ProductRow = ({ product, productQtyInZoho, unit, differenceQty, onValueChange }) => {
  const warnClass = (differenceQty < 0) ? 'text-danger' : '';
  return (
    <tr key={product._id}>
      <td>{product.name}</td>
      <td>{productQtyInZoho}</td>
      <td>{unit}</td>
      <td>
        <FieldGroup
          controlType="number"
          controlName={product.zh_item_id}
          defaultValue=""
          updateValue={onValueChange}
        />
      </td>
      <td className={warnClass}>
        {differenceQty}
      </td>
    </tr>
  );
};

ProductRow.propTypes = {
  product: PropTypes.object.isRequired,
  onValueChange: PropTypes.func.isRequired,
  productQtyInZoho: PropTypes.number.isRequired,
  differenceQty: PropTypes.number.isRequired,
  unit: PropTypes.string.isRequired,
};

export default ProductRow;

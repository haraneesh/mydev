import React from 'react';
import { FormControl } from 'react-bootstrap';
import PropTypes from 'prop-types';

const QuantitySelector = ({
  values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  onChange,
  controlName,
  quantitySelected,
}) => {
  return (
    <FormControl name={controlName} onChange={onChange} componentClass="select" value={quantitySelected}>
      { values.map((selectValue, index) => (
        <option value={selectValue} key={`option-${index}`} > { selectValue } </option>
            ))
        }
    </FormControl>
  );
};

QuantitySelector.propTypes = {
  values: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  controlName: PropTypes.string.isRequired,
  quantitySelected: PropTypes.number,
};

export default QuantitySelector;

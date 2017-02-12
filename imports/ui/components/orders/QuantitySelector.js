import React from 'react';
import { FormControl  } from 'react-bootstrap';

const QuantitySelector = ({ values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], onChange, controlName, quantitySelected }) =>(
  <FormControl name = { controlName } onChange = { onChange } componentClass = "select" value = { quantitySelected }>
    {values.map((selectValue)=>(
      <option value = { selectValue }> { selectValue } </option>
    ))}
  </FormControl>
);

QuantitySelector.propTypes = {
  values: React.PropTypes.array,
  onChange: React.PropTypes.func.isRequired,
  controlName: React.PropTypes.string.isRequired,
};

export default QuantitySelector;

import React from 'react';
import { FormControl } from 'react-bootstrap';
import PropTypes from 'prop-types'

const QuantitySelector = ({ values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], onChange, controlName, quantitySelected, isAdmin }) => {    
  
  if (isAdmin){
    return (
       <FormControl
              type = 'type'
              name = { controlName }
              defaultValue = { quantitySelected }
              onChange = { onChange }
            />
    )
  } else {
    return (
      <FormControl name = { controlName } onChange = { onChange } componentClass = "select" value = { quantitySelected }>
        { values.map((selectValue)=>{
            return(
              <option value = { selectValue }> { selectValue } </option>
            )
          })
        }
      </FormControl>
    )
  }
}

QuantitySelector.propTypes = {
  values: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  controlName: PropTypes.string.isRequired,
  quantitySelected: PropTypes.string,
};

export default QuantitySelector;

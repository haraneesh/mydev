import React from 'react';
import { FormGroup, FormControl } from 'react-bootstrap';

const FieldGroup = ({ displayControlName,
    controlType, controlLabel, controlName, updateValue,
    defaultValue, unitOfSale, options, ...props }) => {
  /* return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />

    </FormGroup>
  );
    }*/
  const displayName = displayControlName || false;
  return (
    <FormGroup>
      {displayName && <h4>{controlLabel}</h4>}
      <FormControl
        type={controlType}
        name={controlName}
        defaultValue={defaultValue}
        onBlur={updateValue}
        componentClass={options || controlType === 'textarea' ? controlType : 'input'}
        {...props}
      >
        {options && options.map((optionValue, index) => (<option value={optionValue} key={`fld-${index}`}> {optionValue}</option>))}
      </FormControl>
    </FormGroup>
  );
};

export default FieldGroup;

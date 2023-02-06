import React from 'react';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';

const FieldGroup = ({
  displayControlName,
  controlType, controlLabel, controlName, updateValue,
  defaultValue, unitOfSale, options, ...props
}) => {
  /* return (
    <Row controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />

    </Row>
  );
    } */
  const displayName = displayControlName || false;
  return (
    <Row>
      {displayName && <h4>{controlLabel}</h4>}
      <Form.Control
        type={controlType}
        name={controlName}
        defaultValue={defaultValue}
        onBlur={updateValue}
        as={options || controlType === 'textarea' ? controlType : 'input'}
        {...props}
      >
        {options && options.map((optionValue, index) => (
          <option value={optionValue} key={`fld-${index}`}>
            {' '}
            {optionValue}
          </option>
        ))}
      </Form.Control>
    </Row>
  );
};

export default FieldGroup;

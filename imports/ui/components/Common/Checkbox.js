import React from 'react';

const Checkbox = ({
  name,
  id = name,
  checked,
  onChange,
  children,
  value,
}) => (
  <div className="form-check">
    <input
      className="form-check-input"
      type="checkbox"
      id={id}
      name={name}
      value={value}
      onClick={onChange}
      checked={checked}
    />
    <label className="form-check-label" htmlFor={id}>
      {children}
    </label>
  </div>

);

export default Checkbox;

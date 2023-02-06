import React from 'react';

const Checkbox = ({
  name,
  checked,
  onChange,
  children,
  value,
}) => (
  <div className="form-check">
    <input
      className="form-check-input"
      type="checkbox"
      id={name}
      name={name}
      value={value}
      onClick={onChange}
      checked={checked}
    />
    <label className="form-check-label" htmlFor={name}>
      {children}
    </label>
  </div>

);

export default Checkbox;

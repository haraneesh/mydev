import PropTypes from 'prop-types';
import React from 'react';
// import { Glyphicon } from 'react-bootstrap';

const getIconStyle = (iconStyle) =>
  ({
    regular: 'far',
    solid: 'fas',
    light: 'fal',
    brand: 'fab',
  })[iconStyle];

const Icon = ({
  icon,
  iconStyle = 'solid',
  type = 'ft',
  className = '',
  style = {},
}) => {
  if (type === 'ft') {
    return (
      <i
        className={`${getIconStyle(iconStyle)} fa-${icon} ${className}`}
        style={style}
      />
    );
  }
  if (type === 'mt') {
    return (
      <span className={`material-symbols-outlined ${className}`} style={style}>
        {icon}
      </span>
    );
  }
  if (type === 'mts') {
    return (
      <i
        className={`material-symbols-outlined fs-4 ${className}`}
        style={{ fontWeight: 900, lineHeight: '0.85' }}
      >
        {icon}
      </i>
    );
  }
  return <i className={`${icon} ${className}`} style={style} />;
};

Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  style: PropTypes.object,
  className: PropTypes.string,
  iconStyle: PropTypes.string,
  type: PropTypes.string,
};

export default Icon;

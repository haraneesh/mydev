import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';

const getIconStyle = (iconStyle) => ({
  regular: 'far',
  solid: 'fas',
  light: 'fal',
  brand: 'fab',
}[iconStyle]);

const Icon = ({
  icon, iconStyle, type, className,
}) => {
  if (type === 'ft') {
    return (<i className={`${getIconStyle(iconStyle)} fa-${icon} ${className}`} />);
  }
  return (<Glyphicon glyph={`${icon}`} />);
};

Icon.defaultProps = {
  className: '',
  iconStyle: 'solid',
  type: 'ft',
};

Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  className: PropTypes.string,
  iconStyle: PropTypes.string,
  type: PropTypes.string,
};

export default Icon;

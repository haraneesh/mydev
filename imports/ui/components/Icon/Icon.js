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
  icon, iconStyle, type, className, style,
}) => {
  if (type === 'ft') {
    return (<i className={`${getIconStyle(iconStyle)} fa-${icon} ${className}`} style={style} />);
  }
  return (<Glyphicon glyph={`${icon}`} className={`${className}`} style={style} />);
};

Icon.defaultProps = {
  className: '',
  iconStyle: 'solid',
  type: 'ft',
  style: {},
};

Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  style: PropTypes.object,
  className: PropTypes.string,
  iconStyle: PropTypes.string,
  type: PropTypes.string,
};

export default Icon;

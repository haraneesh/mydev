import React from 'react';
import PropTypes from 'prop-types';

import './PageHeader.scss';

const PageHeader = ({ title, subtitle }) => (
  <div className="PageHeader">
    <div className="PageHeader-container">
      <h4>{title}</h4>
      {subtitle ? <p>{subtitle}</p> : ''}
    </div>
  </div>
);

PageHeader.defaultProps = {
  subtitle: '',
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};

export default PageHeader;

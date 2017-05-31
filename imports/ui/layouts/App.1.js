import React from 'react';
import { Grid } from 'react-bootstrap';
import AppNavigation from '../containers/AppNavigation.js';
import PropTypes from 'prop-types'

const App = ({ children }) => (
  <div>
    <AppNavigation />
    <Grid>
      { children }
    </Grid>
  </div>
);

App.propTypes = {
  children: PropTypes.node,
};

export default App;

import React, {PropTypes} from 'react'
import { Grid } from 'react-bootstrap'
import AppNavigation from '../containers/AppNavigation'

class App extends React.Component {
  render(){
    return (
      <div>
        <AppNavigation />
        <Grid>
        	{this.props.children}
        </Grid>
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.object.isRequired,
};

export default App;

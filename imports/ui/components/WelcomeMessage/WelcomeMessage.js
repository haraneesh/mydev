import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button } from 'react-bootstrap';
import constants from '../../../modules/constants';

class WelcomeMessage extends React.Component {
    constructor(props, context) {
      super(props, context);
  
      this.handleDismiss = this.handleDismiss.bind(this);
  
      this.state = {
        show: true
      };
    }
  
    getGreetingMessageByTime(){
        const myDate = new Date();
        const hrs = myDate.getHours();

        let greet;

        if (hrs < 12)
            greet = 'Good Morning';
        else if (hrs >= 12 && hrs <= 17)
            greet = 'Good Afternoon';
        else if (hrs >= 17 && hrs <= 24)
            greet = 'Good Evening';

        return greet;
    }

    handleDismiss() {
      this.setState({ show: false });
    }
  
    handleShow() {
      this.setState({ show: true });
    }
  
    render() {
      const {profile} = this.props.loggedInUser;
      if (this.state.show) {
        return (
          <Alert bsStyle="info" onDismiss={this.handleDismiss} style={{marginTop:'2em'}}>
            <p className="lead text-center-not-xs">
                <strong>{this.getGreetingMessageByTime()},</strong> <br className="visible-xs-block" />
                {` ${(profile.salutation)? profile.salutation: ""} ${profile.name.first} ${profile.name.last}`}
            </p>
          </Alert>
        );
      }
  
      return <span></span>;
    }
  }

  WelcomeMessage.propTypes = {
    loggedInUser: PropTypes.object.isRequired,
  }
  
  export default WelcomeMessage;

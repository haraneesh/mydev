import React from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/Alert';

class WelcomeMessage extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  getGreetingMessageByTime() {
    const myDate = new Date();
    const hrs = myDate.getHours();

    let greet;

    if (hrs < 12) greet = 'Good Morning';
    else if (hrs >= 12 && hrs <= 17) greet = 'Good Afternoon';
    else if (hrs >= 17 && hrs <= 24) greet = 'Good Evening';

    return greet;
  }

  render() {
    const { profile } = this.props.loggedInUser;

    return (
      <Alert
        variant="light"
        key="light"
        className="mt-4 bg-white"
      >
        <p className="text-center-not-xs my-1">
          <strong>
            {this.getGreetingMessageByTime()}
            ,
          </strong>
          {' '}
          <br className="d-xs-block d-sm-none" />
          {` ${(profile.salutation) ? profile.salutation : ''} ${profile.name.first} ${profile.name.last}`}
        </p>
      </Alert>
    );
  }
}

WelcomeMessage.propTypes = {
  loggedInUser: PropTypes.object.isRequired,
};

export default WelcomeMessage;

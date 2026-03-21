import React from 'react';
import PropTypes from 'prop-types';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

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
      <Card className="mt-4 bg-body">
        <div className="card-body">
          <Row className="text-center-not-xs my-1">
            <Col xs="12" sm="6" className="text-right-not-xs">
              <strong>
                {this.getGreetingMessageByTime()}
                ,
              </strong>
            </Col>
            <Col xs="12" sm="6" className="text-left-not-xs">
              {' '}
              {` ${(profile.salutation) ? profile.salutation : ''} ${profile.name.first} ${profile.name.last}`}
            </Col>
          </Row>
        </div>
      </Card>

    );
  }
}

WelcomeMessage.propTypes = {
  loggedInUser: PropTypes.object.isRequired,
};

export default WelcomeMessage;

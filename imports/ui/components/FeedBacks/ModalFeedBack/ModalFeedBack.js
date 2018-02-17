/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import Rating from 'react-rating';
import { Modal, Button, Row, Col, FormControl } from 'react-bootstrap';

import './ModalFeedBack.scss';

export default class ModalFeedBack extends React.Component {

  constructor(props) {
    super(props);
    this.state = { value: -1, show: true, feedBackText: '' };

    this.handleRatingChange = this.handleRatingChange.bind(this);
    this.handleDoneClick = this.handleDoneClick.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
  }

  handleRatingChange(value) {
    this.setState({ value });
  }

  handleDescriptionChange(event) {
    this.setState({ feedBackText: event.target.value });
  }

  handleDoneClick() {
    this.props.onClose({
      rating: this.state.value,
      description: this.state.feedBackText,
    });
    this.setState({
      show: false,
    });
  }

  render() {
    const { feedBackOnTitle, feedBackQuestion } = this.props;
    return (
      <div>
        <Modal show={this.state.show} className="modalFeedBack">
          <Modal.Header>
            <Modal.Title> {feedBackOnTitle} </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Row>
              <Col xs={12}>
                <p> {feedBackQuestion} </p>
              </Col>
              <Col xs={12}>
                <div className="ratingsModal">
                  <Rating {...this.props} 
                  initialRating={this.state.value} 
                  onChange={this.handleRatingChange} 
                  emptySymbol="glyphicon glyphicon-star-empty"
                  fullSymbol="glyphicon glyphicon-star"
                  />
                  <span className="text-muted ratingNum">
                  {`  ${this.state.value<0? ' ' : this.state.value}/5`}
                  </span>
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <h4> Suggestions </h4>
              </Col>
              <Col xs={12}>
                <FormControl
                  componentClass="textarea"
                  value={this.state.feedBackText}
                  placeholder="How can we improve your experience?"
                  onChange={this.handleDescriptionChange}
                />
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            { this.state.value > -1 && (<Button onClick={this.handleDoneClick} bsStyle="primary"> Submit </Button>) }
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

ModalFeedBack.defaultProps = {
  loggedUserId: Meteor.userId(),
  feedBackOnPost: 'Suvai',
  feedBackOnTitle: 'Help Us Get Better',
};

ModalFeedBack.propTypes = {
  loggedUserId: PropTypes.string.isRequired,
  onClose: PropTypes.string.isRequired,
  feedBackOnTitle: PropTypes.string.isRequired,
  feedBackQuestion: PropTypes.string,
};

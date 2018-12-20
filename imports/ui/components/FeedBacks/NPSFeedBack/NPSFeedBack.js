/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import Rating from './NPSRating';
import { Modal, Button, Row, Col, FormControl, FormGroup } from 'react-bootstrap';

import './NPSFeedBack.scss';

export default class NPSFeedBack extends React.Component {

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
      questionAsked: this.getUserPropertiesByRating(this.state.value).selectedRatingQuestion,
      description: this.state.feedBackText,
    });
    this.setState({
      show: false,
    });
  }

  getUserPropertiesByRating(rating) {
    const questions =  {
        promoter: {
            selectedRatingQuestion: 'What is the primary reason for your score?',
            selectedRatingClass: 'selectedRatingPromoter',
    },
        passive: {
            selectedRatingQuestion:'What is the one thing we can do to improve your experience?',
            selectedRatingClass: 'selectedRatingPassive',
        },
        detractor: {
            selectedRatingQuestion:'What was missing or disappointing in your experience with us?',
            selectedRatingClass: 'selectedRatingDetractor',
        }
    }

    switch (true) {
        case rating > 8 : 
            return questions.promoter;
        case rating < 7: 
            return questions.detractor;
        default: 
            return questions.passive;
    }
  }

  render() {
    const { feedBackOnTitle, feedBackQuestion } = this.props;
    const { selectedRatingClass, selectedRatingQuestion} = this.getUserPropertiesByRating(this.state.value);
    return (
      <div>
        <Modal show={this.state.show} className="modalNPSFeedBack">
          <Modal.Header>
            <Modal.Title> {feedBackOnTitle} </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <FormGroup>
            <Row className="text-center">
              <Col xs={12}>
                <p> {feedBackQuestion} </p>
              </Col>
              <Col xs={12}>
                <div className="ratingsModal text-center">
                  <Rating
                  initialRating={0} 
                  finalRating={10}
                  selectedRating={this.state.value}
                  selectedRatingClass={selectedRatingClass}
                  onChange={this.handleRatingChange} 
                  />
                </div>
              </Col>
            </Row>
            </FormGroup>
            {this.state.value > -1 && (
            <Row className="text-center">
              <Col xs={12}>
                <p> {selectedRatingQuestion} </p>
              </Col>
              <Col xs={12}>
                <FormControl
                  componentClass="textarea"
                  value={this.state.feedBackText}
                  placeholder=""
                  onChange={this.handleDescriptionChange}
                />
              </Col>
              <Col xs={12}>
                <Button onClick={this.handleDoneClick} bsStyle="primary" className="pull-right" style={{marginTop : "0.5em"}}> Send Rating </Button>
              </Col>
            </Row>
            )
            }
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

NPSFeedBack.defaultProps = {
  loggedUserId: Meteor.userId(),
  feedBackOnPost: 'Suvai',
  feedBackOnTitle: 'Help Us Get Better',
};

NPSFeedBack.propTypes = {
  loggedUserId: PropTypes.string.isRequired,
  onClose: PropTypes.string.isRequired,
  feedBackOnTitle: PropTypes.string.isRequired,
  feedBackQuestion: PropTypes.string,
};

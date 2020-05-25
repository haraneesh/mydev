/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import SurveyQuestion from './SurveyQuestion.js';
import { Modal, Button, Row, Col, FormGroup } from 'react-bootstrap';

import './SurveyFeedBack.scss';

export default class SurveyFeedBack extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ratingsObjectWithValue: {}, show: true };
    this.handleDoneClick = this.handleDoneClick.bind(this);
    this.handleRatingSelect = this.handleRatingSelect.bind(this);
  }

  handleRatingSelect(valueObject) {
    const indexNumber = valueObject.questionIndexNumber;
    const value = this.state.ratingsObjectWithValue;
    value[indexNumber] = {
      questionIndexNumber: valueObject.questionIndexNumber,
      questionText: valueObject.questionText,
      ratingValue: valueObject.ratingValue,
      ratingText: valueObject.ratingText,
    };
    this.setState({ ratingsObjectWithValue: value });
  }


  handleDoneClick() {
    this.props.onClose({
      ratingsObjectWithValue: this.state.ratingsObjectWithValue,
    });
    this.setState({
      show: false,
    });
  }


  render() {
    const { feedBackOnTitle, feedBackQuestion } = this.props;
    return (
      <div>
        <Modal show={this.state.show} className="modalSurveyFeedBack">
          <Modal.Header>
            <Modal.Title> <i className="fas fa-award" style={{ fontSize: '130%' }} /> &nbsp; {feedBackOnTitle} </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <FormGroup>
              <Row>
                <Col xs={12}>
                  <p> {feedBackQuestion} </p>
                </Col>
                <Col xs={12}>
                  <div className="ratingsModal">
                    <SurveyQuestion
                      questionIndexNumber={1}
                      questionText="Would you say you’re eating healthier than before, in the last 30 days?"
                      ratingsObjectArray={[
                        { ratingValue: 4,
                          ratingText: 'Definitely healthier' },
                        { ratingValue: 3,
                          ratingText: 'A little healthier' },
                        { ratingValue: 2,
                          ratingText: 'Same as always' },
                        { ratingValue: 1,
                          ratingText: 'Less healthy' },
                      ]}
                      onChange={this.handleRatingSelect}
                    />
                  </div>
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <p> {feedBackQuestion} </p>
                </Col>
                <Col xs={12}>
                  <div className="ratingsModal">
                    <SurveyQuestion
                      questionIndexNumber={2}
                      questionText="How often did you eat 5 daily servings of fruits and vegetables, in the last 30 days?"
                      ratingsObjectArray={[
                        { ratingValue: 4,
                          ratingText: 'Almost every day in a week' },
                        { ratingValue: 3,
                          ratingText: 'Just 3 or 4 days in a week' },
                        { ratingValue: 2,
                          ratingText: 'Just 1 or 2 days in a week' },
                        { ratingValue: 1,
                          ratingText: 'Never' },
                      ]}
                      onChange={this.handleRatingSelect}
                    />
                  </div>
                </Col>
                <Col xs={12}>
                  <Button
                    onClick={this.handleDoneClick}
                    bsStyle="primary"
                    className="pull-right"
                    style={{ marginTop: '0.5em' }}
                  >
                    Send Survey
                  </Button>
                </Col>
              </Row>
            </FormGroup>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

SurveyFeedBack.defaultProps = {
  loggedUserId: Meteor.userId(),
  feedBackOnPost: 'Suvai',
  feedBackOnTitle: 'Help Us Get Better',
};

SurveyFeedBack.propTypes = {
  loggedUserId: PropTypes.string.isRequired,
  onClose: PropTypes.string.isRequired,
  feedBackOnTitle: PropTypes.string.isRequired,
  feedBackQuestion: PropTypes.string,
};

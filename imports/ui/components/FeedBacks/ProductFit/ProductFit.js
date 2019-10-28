/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import SurveyQuestion from './SurveyQuestion.js';
import { FormControl, Modal, Button, Row, Col, FormGroup } from 'react-bootstrap';

import './ProductFit.scss';

export default class ProductFit extends React.Component {

  constructor(props) {
    super(props);
    this.state = { ratingsObjectWithValue: {}, show: true };
    this.handleDoneClick = this.handleDoneClick.bind(this);
    this.handleRatingSelect = this.handleRatingSelect.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
  }

  handleRatingSelect(valueObject) {
    const indexNumber = valueObject.questionIndexNumber;
    let value = this.state.ratingsObjectWithValue;
    value[indexNumber] = {
      questionIndexNumber: valueObject.questionIndexNumber,
      questionText: valueObject.questionText,
      ratingValue: valueObject.ratingValue,
      ratingText: valueObject.ratingText    
    }
    this.setState({ ratingsObjectWithValue: value });
  }

  handleDescriptionChange(ansOBj,event){
    //this.setState({ feedBackText: event.target.value });
    const indexNumber = ansOBj.questionIndexNumber;
    let value = this.state.ratingsObjectWithValue;
    value[indexNumber] = {
        questionIndexNumber: indexNumber,
        questionText: 'What type of person do you think would benefit most from Suvai?',
        ratingValue: ansOBj.ratingValue,
        ratingText:  event.target.value,   
      }
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
        <Modal show={this.state.show} className="modalProductFit">
          <Modal.Header>
            <Modal.Title> <i class="fas fa-award" style={{fontSize: '130%'}}></i> &nbsp; {feedBackOnTitle} </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <FormGroup>
            <Row>
              <Col xs={12}>
                <div className="ratingsModal">
                  <SurveyQuestion
                  questionIndexNumber={1}
                  questionText='How would you feel if you could no longer use Suvai?'
                  ratingsObjectArray= {[
                     {ratingValue: 3,
                      ratingText: 'Very disappointed'},
                     {ratingValue: 2,
                      ratingText: 'Somewhat disappointed'},
                     {ratingValue: 1,
                        ratingText: 'Not disappointed (it is not meeting my needs)'}, 
                  ]}
                  onChange={this.handleRatingSelect} 
                  />
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <div className="ratingsModal">
                  <SurveyQuestion
                  questionIndexNumber={2}
                  questionText='Have you recommended Suvai to anyone?'
                  ratingsObjectArray={[
                    {ratingValue: 2,
                      ratingText: 'Yes'},
                      {ratingValue: 1,
                        ratingText: 'No'}, 
                  ]}
                  onChange={this.handleRatingSelect} 
                  />
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
              <div className="question">3. What type of person do you think would benefit most from Suvai? </div>
              </Col>
              <Col xs={12}>
                <FormControl
                  componentClass="textarea"
                  value={this.state.feedBackText}
                  placeholder=""
                  onChange={this.handleDescriptionChange.bind(null, {
                    questionIndexNumber: 3,
                    questionText: 'What type of person do you think would benefit most from Suvai?',
                    ratingValue: 1,
                  })}
                />
              </Col>
              <Col xs={12}>
                <Button 
                  onClick={this.handleDoneClick} 
                  bsStyle="primary" 
                  className="pull-right" 
                  style={{marginTop : "0.5em"}}> 
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

ProductFit.defaultProps = {
  loggedUserId: Meteor.userId(),
  feedBackOnPost: 'Suvai',
  feedBackOnTitle: 'Help Us Get Better',
};

ProductFit.propTypes = {
  loggedUserId: PropTypes.string.isRequired,
  onClose: PropTypes.string.isRequired,
  feedBackOnTitle: PropTypes.string.isRequired,
  feedBackQuestion: PropTypes.string,
};

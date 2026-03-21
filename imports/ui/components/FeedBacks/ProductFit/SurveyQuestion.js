/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';

const SurveyQuestion = ({
  questionIndexNumber, questionText, ratingsObjectArray, selectedRatingValue, selectedRatingClass, onChange,
}) => {
  const ratingRows = [];
  const groupName = `groupName${questionIndexNumber}`;

  ratingsObjectArray.forEach((element) => {
    const rowId = `${questionIndexNumber}${element.ratingValue}`;
    ratingRows.push(
      <div className="form-check">
        <input
          type="radio"
          id={rowId}
          className="form-check-input"
          value={element.ratingValue}
          name={groupName}
          onClick={onChange.bind(null, {
            questionIndexNumber,
            questionText,
            ratingValue: element.ratingValue,
            ratingText: element.ratingText,
          })}
        />
        <label className="form-check-label" htmlFor={rowId}>{element.ratingText}</label>
      </div>,
    );
  });

  return (
    <div className="form-group">
      <div className="question">{`${questionIndexNumber}. ${questionText}`}</div>
      <fieldset id={groupName}>
        { ratingRows }
      </fieldset>
    </div>
  );
};

SurveyQuestion.defaultProps = {
  questionText: '',
  ratingsObjectArray: [],
  selectedRatingClass: '',
};

SurveyQuestion.propTypes = {
  questionIndexNumber: PropTypes.number.isRequired,
  questionText: PropTypes.string.isRequired,
  ratingsObjectArray: PropTypes.array.isRequired,
  selectedRatingValue: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};

export default SurveyQuestion;

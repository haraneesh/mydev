/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';

const NPSRating = ({initialRating, finalRating, selectedRating, selectedRatingClass, onChange}) => {

    if (initialRating > finalRating) {
        console.log('Initial Rating is Lesser than Final Rating');
        return [];
    }

    let ratingRows = [];
    for (i = initialRating; i <= finalRating; i++) { 
        const additionalClass = (selectedRating == i)? selectedRatingClass : '';
        ratingRows.push (
            <span className= {`ratingNumberDisplay ${additionalClass}`} key={i} onClick={onChange.bind(null, i)}>{i}</span>
        );
    }
   
    return (
        <div>
            { ratingRows}
            <h4 className="ratingGuide text-muted">
                <span className="pull-left">0 - Least Likely</span>
                <span className="pull-right">10 - Most Likely</span>
            </h4>
        </div>
    );
}

NPSRating.defaultProps = {
    selectedRating: -1,
    selectedRatingClass : '',
}

NPSRating.propTypes = {
    initialRating: PropTypes.number.isRequired,
    finalRating: PropTypes.number.isRequired,
    selectedRatingClass : PropTypes.string,
    selectedRating: PropTypes.number,
    onChange: PropTypes.func.isRequired
};

export default NPSRating;
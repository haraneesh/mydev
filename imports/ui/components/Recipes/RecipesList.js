import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

import { ShowNutritionSummary, ShowEffortSummary } from './recipeHelpers';

import './RecipeList.scss';

const ShowThumbnail = (url) => ({
  backgroundImage: `url(${url})`,
  height: '200px',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
});

const RecipesList = ({ recipes }) => (
  recipes.length > 0 ? (
    <Row className="RecipesList">
      {recipes.map((recipe) => (
        <Col xs={12} md={6}>
          <Row className="entry bg-body">
            <div>
              <Col xs={12} md={4} className="text-center imageCol">
                <div style={ShowThumbnail(recipe.thumbnailUrl)} alt="" />
              </Col>
              <Col xs={12} md={8} className="entry-desc">
                <Row>
                  <h3 className="text-center entry-title">
                    <a href={`/recipes/${recipe._id}`}>{ recipe.title }</a>
                  </h3>
                </Row>
                {/*
                <div className="text-center">
                  <div> { ShowNutritionSummary(recipe) } </div>
                </div>
                */}
                <div className="text-center">
                  <div>
                    { ShowEffortSummary(recipe) }
                  </div>
                </div>
                <Col xs={12} className="text-center btn-view-recipe">
                  <Button bsStyle="primary" href={`/recipes/${recipe._id}`} bsSize="small"> View Recipe </Button>
                </Col>
              </Col>
            </div>
          </Row>
        </Col>
      ))}
    </Row>
  )
    : <Alert variant="info">No recipes yet.</Alert>
);

RecipesList.propTypes = {
  recipes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default RecipesList;

import React from 'react';
import PropTypes from 'prop-types';
import { ListGroup, ListGroupItem, Alert } from 'react-bootstrap';

const RecipesList = ({ recipes }) => (
  recipes.length > 0 ? <ListGroup className="RecipesList">
    {recipes.map(({ _id, title }) => (
      <ListGroupItem key={_id} href={`/recipes/${_id}`} >{ title }</ListGroupItem>
    ))}
  </ListGroup> :
  <Alert bsStyle="info">No recipes yet.</Alert>
);

RecipesList.propTypes = {
  recipes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default RecipesList;

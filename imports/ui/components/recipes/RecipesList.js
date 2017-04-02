import React from 'react';
import { ListGroup, ListGroupItem, Alert } from 'react-bootstrap';

const RecipesList = ({ recipes }) =>(
  recipes.length > 0 ? <ListGroup className="RecipesList">
    {recipes.map(({ _id, title }) => (
      <ListGroupItem key={ _id } href={`/recipes/${_id}`}>{ title }</ListGroupItem>
    ))}
  </ListGroup> :
  <Alert bsStyle="warning">No recipes yet.</Alert>
);

RecipesList.propTypes = {
  recipes: React.PropTypes.array,
};

export default RecipesList;

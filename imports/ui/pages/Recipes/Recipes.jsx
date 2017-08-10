import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { createContainer } from 'meteor/react-meteor-data';
import { Row, Col, Button } from 'react-bootstrap';
import RecipeCollection from '../../../api/Recipes/Recipes';
import RecipesList from '../../components/Recipes/RecipesList';
import Loading from '../../components/Loading/Loading';


// import RecipesList from '../../containers/Recipes/RecipesList.js';


const DEFAULT_LIMIT = 10;
const LIMIT_INCREMENT = 10;
const limit = new ReactiveVar(DEFAULT_LIMIT);

const Recipes = ({ loading, count, recipes, history }) => (!loading ? (
  <div className="Recipes">
    <Row>
      <Col xs={12}>
        <div className="page-header clearfix">
          <h3 className="pull-left">Recipes</h3>
          <Button
            bsStyle="primary"
            className="pull-right"
            href="/recipes/new"
          >New Recipe</Button>
        </div>
        <RecipesList recipes={recipes} count={count} history={history} />
      </Col>
    </Row>
  </div>
) : <Loading />);

Recipes.propTypes = {
  recipes: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
};

export default createContainer(() => {
  const subscriptionsReady = [
    Meteor.subscribe('recipes.list', {
      limit: limit.get(),
    },
  )].every(subscription => subscription.ready());

  const cursor = RecipeCollection.find({}, {
    sort: { createdAt: 1 },
    limit: limit.get(),
  });

  return {
    loading: !subscriptionsReady,
    recipes: cursor && cursor.fetch(),
    count: cursor && cursor.count(),
  };
}, Recipes);

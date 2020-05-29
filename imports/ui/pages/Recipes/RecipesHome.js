import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { Panel, Row, Col, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import Loading from '../../components/Loading/Loading';
import constants from '../../../modules/constants';
import { isLoggedInUserAdmin } from '../../../modules/helpers';

import './RecipesHome.scss';

const catImageSection = (name, classname) => (
  <Col xs={12} sm={8} className={classname}>
    <Image src={`/recipes/${name}.jpg`} responsive />
  </Col>
);

const catNameSection = (name, displayName, recipeCount, index) => (
  <Col xs={12} sm={4} className="text-center">
    <div className={`catName catName${index}`}>
      <h4>{displayName.toUpperCase()}</h4>
      <div><small>{`${(recipeCount) || 0} recipes`}</small></div>
    </div>
  </Col>
);

const recipeHomeCategoryRow = (name, displayName, recipeCount, index) => (<Panel>
  <Row className="rowCategory">
    <Link to={`/recipes/foodType/${name}`}>
      <div className={`recipe${name}`}>
        {catImageSection(name, (index % 2 === 0) ? 'pull-right' : 'pull-left')}
        {catNameSection(name, displayName, recipeCount, index % 4)}
      </div></Link>
  </Row>
</Panel>);

const RecipesHome = () => {
  const [recipeCounts, setRecipesCount] = useState({});
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    Meteor.call('recipes.countByCategory', (error, success) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const rcpCounts = [];
        success.forEach((row) => {
          rcpCounts[row._id.typeOfFood] = row.count;
        });
        setRecipesCount({ rcpCounts });
        setLoading(false);
      }
    });
  }, []);

  const isAdmin = isLoggedInUserAdmin();
  const foodTypes = constants.FoodTypes;
  const foodTypeNames = constants.FoodTypes.names;

  return (!isLoading ? (
    <div className="RecipesHome">
      <Row>
        <Col xs={12}>
          <div className="page-header clearfix">
            <h3>Recipes</h3>
            { isAdmin && <Button
              bsStyle="primary"
              className="pull-right"
              href="/recipes/new"
            >New Recipe</Button> }
          </div>
        </Col>
      </Row>
      {
        foodTypeNames.map((name, index) => {
          if (name === 'snack' || name === 'diabetic') {
            return (recipeHomeCategoryRow(name, foodTypes[name].displayName, recipeCounts[name], index));
          }
        },
        )
      }
    </div>
  ) : <Loading />);
};

export default RecipesHome;

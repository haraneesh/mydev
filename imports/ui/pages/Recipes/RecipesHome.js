import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import {
  Panel, Row, Col, Button,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading/Loading';
import constants from '../../../modules/constants';
import { isLoggedInUserAdmin } from '../../../modules/helpers';
import { RecipeCategoryImage } from '../../components/ImageUpload/ImageUpload';

import './RecipesHome.scss';

const catImageSection = (name, classname) => (
  <Col xs={12} sm={8} className={classname}>
    <RecipeCategoryImage cloudImageId={name} />
  </Col>
);

const catNameSection = (name, displayName, recipeCount, index) => (
  <Col xs={12} sm={4} className="text-center">
    <div className={`catName catName${index}`}>
      <h4>{displayName.toUpperCase()}</h4>
      {/* <h4><small>{`${(recipeCount) || 0} recipes`}</small></h4> */}
    </div>
  </Col>
);

const recipeHomeCategoryRow = (name, displayName, recipeCount, index) => (
  <Panel>
    <Row className="rowCategory">
      <Link to={`/recipes/bycategory/${name}`}>
        <div className={`recipe${name}`}>
          {catImageSection(name, (index % 2 === 0) ? 'pull-right' : 'pull-left')}
          {catNameSection(name, displayName, recipeCount, index % 4)}
        </div>
      </Link>
    </Row>
  </Panel>
);

const RecipesHome = ({ history }) => {
  const [recipeCounts, setRecipesCount] = useState({});
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    Meteor.call('recipes.countByCategory', (error, success) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const rcpCounts = [];
        success.forEach((row) => {
          rcpCounts[row._id.recipeCategory] = row.count;
        });
        setRecipesCount({ rcpCounts });
        setLoading(false);
      }
    });
  }, []);

  const isAdmin = isLoggedInUserAdmin();
  const { RecipeCat } = constants;
  const recipeCatNames = constants.RecipeCat.viewNames;

  return (!isLoading ? (
    <div className="RecipesHome">
      <Row>
        <Col xs={12}>
          <div className="page-header clearfix">
            <h3 className={isAdmin ? 'col-xs-8' : 'col-xs-12'}>Recipes</h3>
            { isAdmin && (
            <Button
              bsStyle="primary"
              className="col-xs-3"
              onClick={() => { history.push('/recipes/new'); }}
            >
              New
            </Button>
            ) }
          </div>
        </Col>
      </Row>
      {
        recipeCatNames.map((name, index) => (recipeHomeCategoryRow(name, RecipeCat[name].displayName, recipeCounts[name], index)))
      }
    </div>
  ) : <Loading />);
};

RecipesHome.propTypes = {
  history: PropTypes.object.isRequired,
};

export default RecipesHome;

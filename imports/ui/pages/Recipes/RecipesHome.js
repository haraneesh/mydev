import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';
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
  <Col xs={12} sm={4} className="d-flex align-items-center justify-content-center">
    <div className={`catName catName${index}`}>
      <h4>{displayName.toUpperCase()}</h4>
      {/* <h4><small>{`${(recipeCount) || 0} recipes`}</small></h4> */}
    </div>
  </Col>
);

const recipeHomeCategoryRow = (name, displayName, recipeCount, index) => (
  <Panel>
    <div className="rowCategory">
      <Link to={`/recipes/bycategory/${name}`}>
        <Row className={`recipe${name}`}>
          {catImageSection(name, (index % 2 === 0) ? 'pull-right' : 'pull-left')}
          {catNameSection(name, displayName, recipeCount, index % 4)}
        </Row>
      </Link>
    </div>
  </Panel>
);

const RecipesHome = ({ history }) => {
  const [recipeCounts, setRecipesCount] = useState({});
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    Meteor.call('recipes.countByCategory', (error, success) => {
      if (error) {
        toast.error(error.reason);
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
          <div className="page-header clearfix row">
            <h2 className={isAdmin ? 'col-xs-9' : 'col-xs-12'}>Recipes</h2>
            { isAdmin && (
              <Col xs={3} className="text-left">
                <Button
                  bsStyle="primary"
                  onClick={() => { history.push('/recipes/new'); }}
                >
                  New
                </Button>
              </Col>
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

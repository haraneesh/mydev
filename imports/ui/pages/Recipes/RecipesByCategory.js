import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';
import {
  Panel, Row, Col, Button,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import DropDownMenu from '../../components/DropDownMenu/DropDownMenu';
import Loading from '../../components/Loading/Loading';
import constants from '../../../modules/constants';
import { isLoggedInUserAdmin } from '../../../modules/helpers';
import { RecipeImageViewThumbnail } from '../../components/ImageUpload/ImageUpload';

import './RecipesHome.scss';

const recipeImageSection = (cloudImageId, classname) => (
  <Col xs={12} sm={6} className={classname}>
    <RecipeImageViewThumbnail cloudImageId={cloudImageId} />
  </Col>
);

const recipeDetailsSection = (recipe) => (
  <Col xs={12} sm={6} className="text-center">
    <div className="recipeDetailSection" style={{ margin: '5% 0' }}>
      <Row>
        <Col xs={12} style={{ marginBottom: '2rem' }}><h4>{recipe.title.toUpperCase()}</h4></Col>
        <Col xs={3} style={{ marginBottom: '1rem' }}>Serves</Col>
        <Col xs={3} style={{ marginBottom: '1rem' }}>{recipe.serves}</Col>

        <Col xs={3} style={{ marginBottom: '1rem' }}>Prep time</Col>
        <Col xs={3} style={{ marginBottom: '1rem' }}>{(recipe.prepTimeInMins > 0) ? `${recipe.prepTimeInMins} mins` : 'No'}</Col>

        <Col xs={3} style={{ marginBottom: '1rem' }}>Level</Col>
        <Col xs={3} style={{ marginBottom: '1rem' }}>{`${recipe.cookingLevel}`}</Col>

        <Col xs={3} style={{ marginBottom: '1rem' }}>Cook time</Col>
        <Col xs={3} style={{ marginBottom: '1rem' }}>{`${recipe.cookingTimeInMins} mins`}</Col>

      </Row>
    </div>
  </Col>
);

function listRecipes(recipe) {
  return (
    <Panel>
      <div className="rowCategory">
        <Link to={`/recipes/${recipe._id}`}>
          <Row className={`recipe${recipe.title}`}>
            {recipeImageSection(recipe.imageId, 'pull-left')}
            {recipeDetailsSection(recipe)}
          </Row>
        </Link>
      </div>
    </Panel>
  );
}

function RecipesByCategory(args) {
  const { history } = args;
  const categoryTag = args.match.params.category;
  const [displayList, setDisplayList] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const { RecipeCat } = constants;
  const viewPageCount = 5;
  let viewPage = 0;
  let showLoadMoreButton = false;

  function fetchRecipeList(pageToLoad) {
    viewPage = pageToLoad;
    Meteor.call('recipes.byCategoryTag', ({
      catName: categoryTag,
      pageNumber: pageToLoad,
      pageCount: viewPageCount,
      isCategory: RecipeCat.names.indexOf(categoryTag) > -1,
    }), (error, dataList) => {
      if (error) {
        toast.error(error.reason);
      } else {
        const tempdisplayList = [...displayList];
        showLoadMoreButton = dataList.count > 0;
        setDisplayList(tempdisplayList.concat(dataList));
        setLoading(false);
      }
    });
  }

  function initializeNewCategory() {
    setDisplayList([]);
  }

  useEffect(() => {
    fetchRecipeList(0);
  }, [categoryTag]);

  const isAdmin = isLoggedInUserAdmin();
  RecipeCat.all = { name: 'all', displayName: 'All' };
  if (RecipeCat.names.indexOf('all') < 0) { RecipeCat.names.push('all'); }

  return (!isLoading ? (
    <div className="RecipesHome">
      { isAdmin && (
      <Row>
        <Col xs={12}>
          <div className="page-header row">
            <h3 className="col-xs-8">
              {
                RecipeCat[categoryTag].displayName
            }
            </h3>

            <Button
              bsStyle="primary"
              className="col-xs-3"
              onClick={() => { history.push('/recipes/new'); }}
            >
              New
            </Button>

          </div>
        </Col>
      </Row>
      )}
      <DropDownMenu
        title={RecipeCat[categoryTag].displayName}
        menuItems={RecipeCat}
        menuItemKeys={RecipeCat.viewNames}
        history={history}
        initializeNewCategory={initializeNewCategory}
        selectedItemKey={RecipeCat[categoryTag].name}
      />
      {
        displayList.map((recipe) => (listRecipes(recipe)))
      }
      { (showLoadMoreButton) && (<Button onClick={() => { fetchRecipeList(viewPage + 1); }} bsStyle="link"> Load More </Button>)}
    </div>
  ) : <Loading />);
}

export default RecipesByCategory;

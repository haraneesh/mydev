import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
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
        <Col xs={12} className="mb-2"><h4>{recipe.title.toUpperCase()}</h4></Col>
        <Col xs={3} className="mb-1">Serves</Col>
        <Col xs={3} className="mb-1">{recipe.serves}</Col>

        <Col xs={3} className="mb-1">Prep time</Col>
        <Col xs={3} className="mb-1">{(recipe.prepTimeInMins > 0) ? `${recipe.prepTimeInMins} mins` : 'No'}</Col>

        <Col xs={3} className="mb-1">Level</Col>
        <Col xs={3} className="mb-1">{`${recipe.cookingLevel}`}</Col>

        <Col xs={3} className="mb-1">Cook time</Col>
        <Col xs={3} className="mb-1">{`${recipe.cookingTimeInMins} mins`}</Col>
      </Row>
    </div>
  </Col>
);

function listRecipes(recipe) {
  return (
    <Row className="bg-body p-2 m-2">
      <div className="rowCategory">
        <Link to={`/recipes/${recipe._id}`}>
          <Row className={`recipe${recipe.title}`}>
            {recipeImageSection(recipe.imageId, 'pull-left')}
            {recipeDetailsSection(recipe)}
          </Row>
        </Link>
      </div>
    </Row>
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

  function initializeNewCategory(currentCategoryTag) {
    if (currentCategoryTag !== categoryTag) {
      setDisplayList([]);
    }
  }

  useEffect(() => {
    fetchRecipeList(0);
  }, [categoryTag]);

  const isAdmin = isLoggedInUserAdmin();
  RecipeCat.all = { name: 'all', displayName: 'All' };
  if (RecipeCat.names.indexOf('all') < 0) { RecipeCat.names.push('all'); }

  return (!isLoading ? (
    <div className="RecipesHome pb-4">
      { isAdmin && (
      <Row>
        <Col xs={12}>
          <div className="py-4 px-2 row">
            <h3 className="col-9">
              {
                RecipeCat[categoryTag].displayName
            }
            </h3>
            <Col xs={3}>
              <Button
                variant="secondary"
                onClick={() => { history.push('/recipes/new'); }}
                className="px-4 text-right"
                size="sm"
              >
                New
              </Button>
            </Col>
          </div>
        </Col>
      </Row>
      )}
      <div className="mx-2">
        <DropDownMenu
          title={RecipeCat[categoryTag].displayName}
          menuItems={RecipeCat}
          menuItemKeys={RecipeCat.viewNames}
          history={history}
          initializeNewCategory={initializeNewCategory}
          selectedItemKey={RecipeCat[categoryTag].name}
        />
      </div>
      {
        displayList.map((recipe) => (listRecipes(recipe)))
      }
      { (showLoadMoreButton) && (<Button onClick={() => { fetchRecipeList(viewPage + 1); }} variant="link"> Load More </Button>)}
    </div>
  ) : <Loading />);
}

export default RecipesByCategory;

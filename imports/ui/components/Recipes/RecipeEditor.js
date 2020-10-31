/* eslint-disable max-len, no-return-assign */

import React, { useEffect, useState, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  FormGroup, FormControl, Button, ButtonToolbar, Row, Col,
} from 'react-bootstrap';
import RecipeRTE from './RecipeRTE/RecipeRTE';
import { upsertRecipeDraft, upsertRecipePublish, removeRecipe } from '../../../api/Recipes/methods';
import IngredientSelector from './IngredientSelector';
import ImageUploader, { RecipeImageViewHero } from '../ImageUpload/ImageUpload';
import constants from '../../../modules/constants';

const createIngredientsHash = (ingredients) => {
  const ingredientsHash = {};
  ingredients.forEach((ingredient) => {
    ingredientsHash[ingredient._id] = ingredient;
  });
  return ingredientsHash;
};

// export default class RecipeEditor extends React.Component {
const RecipeEditor = ({ recipe, history }) => {
  const [imageProps, setImageProps] = useState(
    {
      imageId: (recipe && recipe.imageId) ? recipe.imageId : null,
      imageUrl: (recipe && recipe.imageUrl) ? recipe.imageUrl : null,
    },
  );

  const ingredientListRef = useRef((recipe && recipe.ingredients) ? createIngredientsHash(recipe.ingredients) : {});

  // const recipeUrl = (recipe && recipe.imageUrl) ? recipe.imageUrl : '';

  function ingredientListUpdate(ingredientList) {
    ingredientListRef.current = { ...ingredientList };
  }

  function ingredientListOnChange(ingredientId, ingredient) {
    ingredientListRef.current[ingredientId] = ingredient;
  }

  function updateRecipe(updRecipe, updPublishStatus, silentUpdate = false) {
    const upsertRecipe = (updPublishStatus === constants.PublishStatus.Published.name) ? upsertRecipePublish : upsertRecipeDraft;
    upsertRecipe.call(updRecipe, (error, msg) => {
      if (error) {
        toast.error(error.message);
      } else if (!silentUpdate) {
        const { insertedId } = msg;
        const message = 'Changes to Recipe have been Saved!';
        toast.success(message);
        if (updPublishStatus === constants.PublishStatus.Published.name) {
          history.push('/recipes');
        } else {
          history.push(`/recipes/${insertedId || updRecipe._id}/edit`);
        }
      }
    });
  }

  function cancelSaveRecipe() {
    history.push('/recipes/');
  }

  function addNewRecipe() {
    const updRecipe = {
      title: document.querySelector('[name="title"]').value.trim(),
    };

    updateRecipe(updRecipe, constants.PublishStatus.Draft.name, false);
  }

  function deleteRecipe() {
    if (confirm('Are you sure, you want to delete the recipe? This is permanent!')) {
      removeRecipe.call({ recipeId: recipe._id }, (err) => {
        if (err) {
          toast.error(err.reason);
        } else {
          toast.success('Recipe deleted!');
          history.push('/recipes/');
        }
      });
    }
  }

  function retMultiSelectedValueInArr(options) {
    const result = [];

    if (options) {
      for (let i = 0, iLen = options.length; i < iLen; i += 1) {
        const opt = options[i];

        if (opt.selected) {
          result.push(opt.value /* || opt.text */);
        }
      }
    }
    return result;
  }

  function changeImage({ imageUrl, thumbNailUrl, imageId }) {
    Meteor.call('recipes.updateImageUrl', ({
      recipeId: recipe._id, imageUrl, thumbNailUrl, imageId,
    }), (error, msg) => {
      if (error) {
        toast.error(error.reason);
      } else {
        setImageProps({
          imageUrl,
          imageId,
        });
      }
    });
  }

  const rteContent = useRef((recipe && recipe.description) ? recipe.description : '');

  function rteValueUpdate(value) {
    rteContent.current = value;
  }

  function saveOrUpdateRecipe(event, updPublishStatus) {
    const updRecipe = {
      _id: recipe ? recipe._id : '',
      title: document.querySelector('[name="title"]').value.trim(),
      description: rteContent.current,
      ingredients: Object.keys(ingredientListRef.current).map((ingredientId) => ingredientListRef.current[ingredientId]),
      imageUrl: imageProps.imageUrl,
      imageId: imageProps.imageId,
      prepTimeInMins: parseFloat(document.querySelector('[name="prepTimeInMins"]').value.trim()),
      cookingTimeInMins: parseFloat(document.querySelector('[name="cookingTimeInMins"]').value.trim()),
      serves: parseFloat(document.querySelector('[name="serves"]').value.trim()),
      recipeCategory: retMultiSelectedValueInArr(document.querySelector('[name="recipeCategory"]').children),
      cookingLevel: document.querySelector('[name="cookingLevel"]').value.trim(),
    };

    updateRecipe(updRecipe, updPublishStatus);
  }

  if (recipe) {
    return (
      <form onSubmit={(event) => event.preventDefault()}>
        <FormGroup>
          <h4>Title</h4>
          <FormControl
            type="text"
            name="title"
            defaultValue={recipe && recipe.title}
            placeholder="Title of the recipe"
            required
          />
        </FormGroup>

        <FormGroup>
          <h4>Banner Image</h4>
          {imageProps.imageId && (<RecipeImageViewHero cloudImageId={imageProps.imageId} />) }
          <ImageUploader onChange={changeImage} folder="recipes" imageId={imageProps.imageId} />
        </FormGroup>
        <FormGroup>
          <h4>Ingredients</h4>
          <IngredientSelector
            controlName="IngredientSelector"
            ingredients={recipe && recipe.ingredients}
            updateIngredientList={ingredientListUpdate}
            onChange={ingredientListOnChange}
          />
        </FormGroup>
        <Row>
          <Col xs={6} sm={3} className="rowRightSpacing">
            <h4>Prep Time in Mins</h4>
            <FormControl
              type="text"
              name="prepTimeInMins"
              defaultValue={recipe && recipe.prepTimeInMins}
              placeholder="0"
              required
            />
          </Col>
          <Col xs={6} sm={3}>
            <h4>Cooking Time in Mins</h4>
            <FormControl
              type="text"
              name="cookingTimeInMins"
              defaultValue={recipe && recipe.cookingTimeInMins}
              placeholder="1"
              required
            />
          </Col>
          <Col xs={6} sm={3} className="rowRightSpacing">
            <h4>Cooking Level</h4>
            <FormControl
              name="cookingLevel"
            // onChange={onChange}
              componentClass="select"
              required
              defaultValue={recipe && recipe.level}
            >
              { constants.DifficultyLevels.map((selectValue) => (
                <option value={selectValue} key={`option-${selectValue}`}>
                  {' '}
                  { selectValue }
                  {' '}
                </option>
              ))}
            </FormControl>
          </Col>
          <Col xs={6} sm={3}>
            <h4>Serves </h4>
            <FormControl
              type="text"
              name="serves"
              defaultValue={recipe && recipe.serves}
              placeholder="4"
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <h4>Food Type</h4>
            <FormControl
              style={{ height: '170px' }}
              name="recipeCategory"
              componentClass="select"
              multiple
              required
            >
              { constants.RecipeCat.names.map((name) => (
                <option
                  value={name}
                  key={`option-${name}`}
                  selected={recipe.recipeCategory && recipe.recipeCategory.includes(name)}
                >
                  {' '}
                  { constants.RecipeCat[name].displayName }
                  {' '}

                </option>
              ))}
            </FormControl>
          </Col>
        </Row>
        <FormGroup>
          <h4>Instructions</h4>
          <RecipeRTE description={recipe.description} rteValueUpdate={rteValueUpdate} />

        </FormGroup>
        <ButtonToolbar>
          <Button bsSize="small" type="submit" bsStyle="primary" onClick={(event) => saveOrUpdateRecipe(event, constants.PublishStatus.Published.name)}>
            Save and Publish
          </Button>
          <Button bsSize="small" type="submit" onClick={(event) => saveOrUpdateRecipe(event, constants.PublishStatus.Draft.name)}>
            Save as Draft
          </Button>
          <Button bsSize="small" type="submit" onClick={cancelSaveRecipe}>
            Cancel Edit
          </Button>

          <Button bsSize="small" className="pull-right" onClick={deleteRecipe}>Delete Recipe</Button>
        </ButtonToolbar>

      </form>
    );
  }

  return (
    <FormGroup>
      <h4>Title</h4>
      <FormControl
        type="text"
        name="title"
        defaultValue={recipe && recipe.title}
        placeholder="Title of the recipe"
      />
      <Button type="submit" onClick={addNewRecipe}> Add New Recipe </Button>
    </FormGroup>
  );
};

RecipeEditor.propTypes = {
  recipe: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default RecipeEditor;

/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormControl, Button, ButtonToolbar, Row, Col } from 'react-bootstrap';
import RichTextEditor, { EditorValue } from 'react-rte';
import { convertToRaw, convertFromRaw, EditorState } from 'draft-js';
import { upsertRecipeDraft, upsertRecipePublish, removeRecipe } from '../../../api/Recipes/methods';
import IngredientSelector from './IngredientSelector';
import { Bert } from 'meteor/themeteorchef:bert';
import ImageUploader from '../Common/ImageUploader';
import constants from '../../../modules/constants';

export default class RecipeEditor extends React.Component {
  constructor(props, context) {
    super(props, context);
    this._initialize(this.props.recipe, true);

    this.ingredientListOnChange = this.ingredientListOnChange.bind(this);
    this.saveOrUpdateRecipe = this.saveOrUpdateRecipe.bind(this);
    this.onRichTextEditorChange = this.onRichTextEditorChange.bind(this);
    this.updateImageUrl = this.updateImageUrl.bind(this);
    this.cancelSaveRecipe = this.cancelSaveRecipe.bind(this);
    this.addNewRecipe = this.addNewRecipe.bind(this);
    this.deleteRecipe = this.deleteRecipe.bind(this);
  }

  _initialize(recipe) {
    let editorValue;
    if (recipe && recipe.description) {
      const contentState = convertFromRaw(recipe.description);
      const editorState = EditorState.createWithContent(contentState);
      editorValue = new EditorValue(editorState);
    }

    this.state = {
      value: (editorValue) || RichTextEditor.createEmptyValue(),
      publishStatus: (recipe) ? recipe.publishStatus : constants.PublishStatus.Draft.name,
    };

    this._url = '';
  }

  componentDidMount() {
    // recipeEditor({ component: this });
    setTimeout(() => { document.querySelector('[name="title"]').focus(); }, 0);
  }

  ingredientListOnChange(ingredientList) {
    this._ingredientList = ingredientList;
  }

  onRichTextEditorChange(value) {
    this.setState({ value });
  }

  updateImageUrl(url) {
    this._url = url;
    const recipe = {
      _id: this.props.recipe._id,
      title: document.querySelector('[name="title"]').value.trim(),
      imageUrl: url,
    };

    this.updateRecipe(recipe, this.state.publishStatus, true);
  }

  cancelSaveRecipe() {
    this.props.history.push('/recipes/');
  }

  addNewRecipe() {
    const recipe = {
      title: document.querySelector('[name="title"]').value.trim(),
    };

    this.updateRecipe(recipe, constants.PublishStatus.Draft.name, false);
  }

  deleteRecipe() {
    if (confirm('Are you sure, you want to delete the recipe? This is permanent!')) {
      removeRecipe.call({ recipeId: this.props.recipe._id }, (err) => {
        if (err) {
          Bert.alert(err.reason, 'danger');
        } else {
          Bert.alert('Recipe deleted!', 'success');
          this.props.history.push('/recipes/');
        }
      });
    }
  }

  updateRecipe(recipe, publishStatus, silentUpdate = false) {
    const upsertRecipe = (publishStatus === constants.PublishStatus.Published.name) ? upsertRecipePublish : upsertRecipeDraft;
    upsertRecipe.call(recipe, (error, msg) => {
      if (error) {
        Bert.alert(error.message, 'danger');
      } else if (!silentUpdate) {
        const insertedId = msg.insertedId;
        const message = 'Changes to Recipe have been Saved!';
        Bert.alert(message, 'success');
        if (publishStatus === constants.PublishStatus.Published.name) {
          this.props.history.push('/recipes');
        } else {
          this.props.history.push(`/recipes/${insertedId || recipe._id}/edit`);
        }
      }
    });
  }

  objectToValueArray(ingredientList) {
    const ingredients = [];
    _.each(ingredientList, (value, key) => {
      ingredients.push(value);
    });
    return ingredients;
  }

  richTextEditorToolbar() {
    // The toolbarConfig object allows you to specify custom buttons, reorder buttons and to add custom css classes.
    // Supported inline styles: https://github.com/facebook/draft-js/blob/master/docs/Advanced-Topics-Inline-Styles.md
    // Supported block types: https://github.com/facebook/draft-js/blob/master/docs/Advanced-Topics-Custom-Block-Render.md#draft-default-block-render-map
    const toolbarConfig = {
      // Optionally specify the groups to display (displayed in the order listed).
      display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', /* 'LINK_BUTTONS', 'BLOCK_TYPE_DROPDOWN', */ 'HISTORY_BUTTONS'],
      INLINE_STYLE_BUTTONS: [
        { label: 'Bold', style: 'BOLD', className: 'custom-css-class' },
        { label: 'Italic', style: 'ITALIC' },
        { label: 'Underline', style: 'UNDERLINE' },
      ],
      BLOCK_TYPE_DROPDOWN: [
        { label: 'Normal', style: 'unstyled' },
        { label: 'Heading Large', style: 'header-one' },
        { label: 'Heading Medium', style: 'header-two' },
        { label: 'Heading Small', style: 'header-three' },
      ],
      BLOCK_TYPE_BUTTONS: [
        { label: 'List', style: 'unordered-list-item' },
        { label: 'Numbered List', style: 'ordered-list-item' },
      ],
    };
    return toolbarConfig;
  }


  saveOrUpdateRecipe(event, publishStatus) {
    const editorState = this.state.value.getEditorState();
    const contentState = editorState.getCurrentContent();
    const recipe = {
      title: document.querySelector('[name="title"]').value.trim(),
      // description: document.querySelector('[name="body"]').value.trim(),
      description: convertToRaw(contentState),
      ingredients: this.objectToValueArray(this._ingredientList),
      _id: this.props.recipe ? this.props.recipe._id : '',
      imageUrl: this._url,
      cookingTimeInMins: parseFloat(document.querySelector('[name="cookingTimeInMins"]').value.trim()),
      serves: parseFloat(document.querySelector('[name="serves"]').value.trim()),
      typeOfFood: document.querySelector('[name="typeOfFood"]').value.trim(),
      cookingLevel: document.querySelector('[name="cookingLevel"]').value.trim(),
    };

    this.updateRecipe(recipe, publishStatus);
  }

  render() {
    const { recipe } = this.props;

    if (recipe) {
      return (<form onSubmit={event => event.preventDefault()}>
        <FormGroup>
          <h4>Title</h4>
          <FormControl
            type="text"
            name="title"
            defaultValue={recipe && recipe.title}
            placeholder="Title of the recipe"
          />
        </FormGroup>
        <FormGroup>
          <h4>Add Photo</h4>
          <ImageUploader
            imageUrl={(recipe) ? recipe.imageUrl : ''}
            updateImageUrl={this.updateImageUrl}
            imageNameOnServer={(recipe) ? recipe.title.replace(/\s+/g, '-') : ''}
            id={(recipe) ? recipe._id : ''}
          />
        </FormGroup>
        <FormGroup>
          <h4>Ingredients</h4>
          <IngredientSelector
            controlName="IngredientSelector"
            ingredients={recipe && recipe.ingredients}
            onChange={this.ingredientListOnChange}
          />
        </FormGroup>
        <Row>
          <Col xs={4} sm={3}>
            <h4>Serves how many?</h4>
            <FormControl
              type="text"
              name="serves"
              defaultValue={recipe && recipe.serves}
              placeholder="4"
            />
          </Col>
          <Col xs={4} sm={3}>
            <h4>Cooking Time in Mins</h4>
            <FormControl
              type="text"
              name="cookingTimeInMins"
              defaultValue={recipe && recipe.cookingTimeInMins}
              placeholder="1"
            />
          </Col>
          <Col xs={4} sm={3}>
            <h4>Cooking Level</h4>
            <FormControl
              name="cookingLevel"
              // onChange={onChange}
              componentClass="select"
              defaultValue={recipe && recipe.level}
            >
              { constants.DifficultyLevels.map(selectValue => (
                <option value={selectValue} key={`option-${selectValue}`} > { selectValue } </option>
                ))
              }
            </FormControl>
          </Col>
          <Col xs={4} sm={3}>
            <h4>Food Type</h4>
            <FormControl
              name="typeOfFood"
              // onChange={onChange}
              componentClass="select"
              defaultValue={recipe && recipe.level}
            >
              { constants.FoodTypes.map(selectValue => (
                <option value={selectValue} key={`option-${selectValue}`} > { selectValue } </option>
                ))
              }
            </FormControl>
          </Col>
        </Row>
        <FormGroup>
          <h4>Preparation</h4>
          <RichTextEditor
            value={this.state.value}
            onChange={this.onRichTextEditorChange}
            toolbarConfig={this.richTextEditorToolbar()}
            placeholder="Share detailed cooking instructions"
            className="richTextEditor"
          />
        </FormGroup>
        <ButtonToolbar >
          <Button bsSize="small" type="submit" bsStyle="primary" onClick={event => this.saveOrUpdateRecipe(event, constants.PublishStatus.Published.name)}>
            Save and Publish
        </Button>
          <Button bsSize="small" type="submit" onClick={event => this.saveOrUpdateRecipe(event, constants.PublishStatus.Draft.name)}>
            Save as Draft
        </Button>
          <Button bsSize="small" type="submit" onClick={this.cancelSaveRecipe}>
            Cancel Edit
        </Button>

          <Button bsSize="small" className="pull-right" onClick={this.deleteRecipe}>Delete Recipe</Button>
        </ButtonToolbar>

      </form>);
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
        <Button type="submit" onClick={this.addNewRecipe}>Add New Recipe </Button>
      </FormGroup>
    );
  }
}

RecipeEditor.propTypes = {
  recipe: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

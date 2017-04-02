/* eslint-disable max-len, no-return-assign */

import React from 'react';
import { FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
import RichTextEditor,{EditorValue} from 'react-rte'
import { convertToRaw, convertFromRaw, EditorState } from 'draft-js'
import { upsertRecipe } from '../../../api/recipes/methods'
import IngredientSelector from './IngredientSelector'
import { Bert } from 'meteor/themeteorchef:bert'
import { browserHistory } from 'react-router'
import ImageUploader from '../common/ImageUploader'

export default class RecipeEditor extends React.Component {
  constructor (props, context){
      super(props, context)
      const { recipe } = this.props;

      let editorValue      
      if (recipe){
        const contentState = convertFromRaw(recipe.description) 
        const editorState = EditorState.createWithContent(contentState)
        editorValue = new EditorValue(editorState)
      }

      this.state = {
        value: (recipe) ? editorValue : RichTextEditor.createEmptyValue()
      }

      this._url = ""

      this.ingredientListOnChange = this.ingredientListOnChange.bind(this)
      this.saveOrUpdateRecipe = this.saveOrUpdateRecipe.bind(this)
      this.onRichTextEditorChange = this.onRichTextEditorChange.bind(this)
      this.updateImageUrl = this.updateImageUrl.bind(this) 
      this.cancelSaveRecipe = this.cancelSaveRecipe.bind(this)
  }

  componentDidMount() {
   // recipeEditor({ component: this });
    setTimeout(() => { document.querySelector('[name="title"]').focus(); }, 0);
  }

  ingredientListOnChange(ingredientList){
      this._ingredientList = ingredientList
  }

  onRichTextEditorChange(value){
    this.setState({value})
  }

  updateImageUrl(url){
    //this.setState({url})
    this._url = url
  }

  cancelSaveRecipe(){
      browserHistory.push(`/recipes/${this.props.recipe._id}`);
  }

  saveOrUpdateRecipe(){
      this._currentUser = Meteor.user()

      let editorState = this.state.value.getEditorState();
      let contentState = editorState.getCurrentContent();

      const recipe = {
         title: document.querySelector('[name="title"]').value.trim(),
         //description: document.querySelector('[name="body"]').value.trim(),
         description: convertToRaw(contentState),
         ingredients: this.objectToValueArray(this._ingredientList),
         owner: this._currentUser._id,
         _id: this.props.recipe ? this.props.recipe._id: "",
         imageUrl: this._url
      }

      upsertRecipe.call(recipe, (error, msg) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          const { insertedId } = msg
          const message = insertedId? "Created New Recipe!" : "Updated Recipe!"
          Bert.alert(message, 'success')
          browserHistory.push(`/recipes/${insertedId || recipe._id}`);
        }
      });
  }

  objectToValueArray(ingredientList){
    let ingredients = []
    _.each(ingredientList, function(value, key){
       ingredients.push(value)
    })
    return ingredients
  }

  richTextEditorToolbar(){
    // The toolbarConfig object allows you to specify custom buttons, reorder buttons and to add custom css classes.
    // Supported inline styles: https://github.com/facebook/draft-js/blob/master/docs/Advanced-Topics-Inline-Styles.md
    // Supported block types: https://github.com/facebook/draft-js/blob/master/docs/Advanced-Topics-Custom-Block-Render.md#draft-default-block-render-map
    const toolbarConfig = {
      // Optionally specify the groups to display (displayed in the order listed).
      display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', /*'LINK_BUTTONS', 'BLOCK_TYPE_DROPDOWN',*/ 'HISTORY_BUTTONS'],
      INLINE_STYLE_BUTTONS: [
        {label: 'Bold', style: 'BOLD', className: 'custom-css-class'},
        {label: 'Italic', style: 'ITALIC'},
        {label: 'Underline', style: 'UNDERLINE'}
      ],
      BLOCK_TYPE_DROPDOWN: [
        {label: 'Normal', style: 'unstyled'},
        {label: 'Heading Large', style: 'header-one'},
        {label: 'Heading Medium', style: 'header-two'},
        {label: 'Heading Small', style: 'header-three'}
      ],
      BLOCK_TYPE_BUTTONS: [
        {label: 'List', style: 'unordered-list-item'},
        {label: 'Numbered List', style: 'ordered-list-item'}
      ]
    };
    return toolbarConfig;
  }

  render() {
    const { recipe } = this.props;
    return (<form
      ref={ form => (this.recipeEditorForm = form) }
      onSubmit={ event => event.preventDefault() }
      >
      <FormGroup>
        <h4>Title</h4>
        <FormControl
          type="text"
          name="title"
          defaultValue={ recipe && recipe.title }
          placeholder="Title of the recipe"
        />
      </FormGroup>
      <FormGroup>
        <h4>Add Photos</h4>
        <ImageUploader recipe= { recipe } updateImageUrl = { this.updateImageUrl }/>
      </FormGroup>
      <FormGroup>
          <h4>Ingredients</h4>
          <IngredientSelector 
            controlName = "IngredientSelector" 
            ingredients = { recipe && recipe.ingredients } 
            onChange = { this.ingredientListOnChange }
          />
      </FormGroup>
      <FormGroup>
        <h4>Preparation</h4>
         <RichTextEditor
            value = { this.state.value }
            onChange = { this.onRichTextEditorChange }
            toolbarConfig = { this.richTextEditorToolbar() }
            placeholder = "Share detailed cooking instructions"
            className = "richTextEditor"
         />
      </FormGroup>
      <Button type="submit" onClick={this.cancelSaveRecipe}>Cancel </Button>
      <Button type="submit" bsStyle="primary" onClick={this.saveOrUpdateRecipe}>
        { recipe && recipe._id ? 'Save Changes' : 'Share Recipe' }
      </Button>
    </form>);
  }
}

RecipeEditor.propTypes = {
  recipe: React.PropTypes.object,
};

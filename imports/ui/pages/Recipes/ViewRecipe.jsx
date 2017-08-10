import React from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar, Button, Panel } from 'react-bootstrap';
import { Editor, convertFromRaw, EditorState } from 'draft-js';
import { Bert } from 'meteor/themeteorchef:bert';
import constants from '../../../modules/constants';
import { removeRecipe } from '../../../api/Recipes/methods';
import Comments from '../../containers/Comments/GetComments';
import { insertToUserAndPosts } from '../../../api/UserAndPosts/methods';

export default class ViewRecipe extends React.Component {
  componentDidMount() {
    const recipe = this.props.recipe;
    const loggedInUser = this.props.loggedInUserId;
    if (recipe.owner === loggedInUser) {
      if (recipe.publishStatus === constants.PublishStatus.Draft.name) {
        this.props.history.push(`/recipes/${recipe._id}/edit`);
      }
    }
    /*
    else {
      insertToUserAndPosts.call({ postId: recipe._id }, (error) => {
        if (error) {
          console.log(error.reason);
        }
      });
      // success of failure - don't bother the user
    }*/
  }

  handleRemove(_id) {
    if (confirm('Are you sure, you want to delete the recipe? This is permanent!')) {
      removeRecipe.call({ recipeId: _id }, (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert('Recipe deleted!', 'success');
          this.props.history.push('/recipes');
        }
      });
    }
  }

  render() {
    const recipe = this.props.recipe;
    const isOwner = (recipe.owner === this.props.loggedInUserId);

    if (recipe.publishStatus !== constants.PublishStatus.Draft.name) {
      const contentState = convertFromRaw(recipe.description);
      const editorState = EditorState.createWithContent(contentState);

      return (
        <div className="ViewRecipe">
          <div className="page-header clearfix">
            <h3 className="pull-left">{recipe.title}</h3>
            <ButtonToolbar className="pull-right">
              {isOwner && <Button bsSize="small" href={`/recipes/${recipe._id}/edit`}>Edit</Button>}
            </ButtonToolbar>
          </div>
          {recipe.imageUrl && <div className="view-recipe-image" style={{ backgroundImage: `url('${recipe.imageUrl}')` }} />}
          <Panel>
            <h4>Ingredients</h4>
            <ol>
              {recipe.ingredients.map((ingredient, index) => (<li key={`ingredient-${index}`}> {ingredient} </li>))}
            </ol>
          </Panel>
          <Panel>
            <h4>Preparation</h4>
            <div className="panel-body">
              <Editor editorState={editorState} readOnly className="view-recipe" />
            </div>
          </Panel>
          <Panel>
            <h4>Responses</h4>
            <Comments postId={recipe._id} />
          </Panel>
        </div>
      );
    }
    return (<div />);
  }
}
ViewRecipe.propTypes = {
  recipe: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  loggedInUserId: PropTypes.string.isRequired,
};

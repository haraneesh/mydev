import React from 'react';
import { ButtonToolbar, Button, Panel, Row, ControlLabel, Image } from 'react-bootstrap';
import { Editor, convertFromRaw, EditorState } from 'draft-js';
import { browserHistory } from 'react-router';
import { Bert } from 'meteor/themeteorchef:bert';
import constants from '../../../modules/constants';
import { removeRecipe } from '../../../api/recipes/methods';
import Comments from '../../containers/comments/getComments';
import PropTypes from 'prop-types';

export default class ViewRecipe extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    const recipe = this.props.recipe;
    if (recipe.publishStatus === constants.PublishStatus.Draft.name) {
      browserHistory.push(`/recipes/${recipe._id}/edit`);
    }
  }

  handleRemove(_id) {
    if (confirm('Are you sure, you want to delete the recipe? This is permanent!')) {
      removeRecipe.call({ recipeId: _id }, (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert('Recipe deleted!', 'success');
          browserHistory.push('/recipes');
        }
      });
    }
  }

  render() {
    const recipe = this.props.recipe;
    const isOwner = (recipe.owner === Meteor.user()._id);

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
              {recipe.ingredients.map(ingredient => (<li> {ingredient} </li>))}
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
};

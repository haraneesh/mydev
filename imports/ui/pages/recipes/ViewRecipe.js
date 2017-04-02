import React from 'react';
import { ButtonToolbar, Button, Panel, Row, ControlLabel } from 'react-bootstrap';
import { Editor, convertFromRaw, EditorState} from 'draft-js'
import { browserHistory } from 'react-router';
import { Bert } from 'meteor/themeteorchef:bert';
import { removeRecipe } from '../../../api/recipes/methods';
import Comments from '../../containers/comments/getComments';

const handleRemove = (_id) => {
  if (confirm('Are you sure, you want to delete? This is permanent!')) {
    removeRecipe.call({ _id }, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Recipe deleted!', 'success');
        browserHistory.push('/recipes');
      }
    });
  }
};

const ViewRecipe = ({ recipe }) => {
  
  const contentState = convertFromRaw(recipe.description) 
  const editorState = EditorState.createWithContent(contentState)

  return (
    <div className="ViewRecipe">
      <div className="page-header clearfix">
        <h3 className="pull-left">{ recipe.title }</h3>
        <ButtonToolbar className="pull-right">
        
            <Button bsSize="small" href={`/recipes/${recipe._id}/edit`}>Edit</Button>
            <Button bsSize="small" onClick={ () => handleRemove(recipe._id) }>Delete</Button>
          
        </ButtonToolbar>
      </div>
      <Panel>
          <h4>Ingredients</h4>
          <ol>
            { recipe.ingredients.map(function(ingredient){
                return (<li> { ingredient } </li>) 
              })
            }
          </ol>
      </Panel>
      <Panel>
        <h4>Preparation</h4>
         <div className = "panel-body">
          <Editor editorState = { editorState } readOnly = { true } className = "view-recipe"/>
         </div>
      </Panel>
      <Panel>
        <h4>Responses</h4>
        <Comments postId = { recipe._id }/>
      </Panel>
    </div>
  );
  }
ViewRecipe.propTypes = {
  recipe: React.PropTypes.object.isRequired,
};

export default ViewRecipe;

import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar, Button, Panel, Row, Col } from 'react-bootstrap';
import { Editor, convertFromRaw, EditorState } from 'draft-js';
import { Bert } from 'meteor/themeteorchef:bert';
import Recipes from '../../../api/Recipes/Recipes';
import constants from '../../../modules/constants';
import { removeRecipe } from '../../../api/Recipes/methods';
import Comments from '../../containers/Comments/getComments';
import { ShowNutritionSummary, ShowEffortSummary } from '../../components/Recipes/recipeHelpers';

import { insertToUserAndPosts } from '../../../api/UserAndPosts/methods';

import './ViewRecipe.scss';

class ViewRecipe extends React.Component {
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
    } */
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
    const loggedUserId = this.props.loggedInUserId;
    const isOwner = (recipe.owner === loggedUserId);

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
          
          {recipe.imageUrl && <Panel> <div className="view-recipe-image" style={{ backgroundImage: `url('${recipe.imageUrl}')` }} /> </Panel>}
          
          <Panel>
            <Row className="text-center">
              { ShowEffortSummary(recipe) }
            </Row>
          </Panel>
          <Panel className="ingredientsView">
            <h4>Ingredients</h4>
            <Col xs={12}>
              <ol>
                {recipe.ingredients.map((ing, index) => (<li key={`ingredient-${index}`}>
                  {
                    (ing.displayName) ? ing.displayName : `${ing.selectedWeight.Amount} ${ing.selectedWeight.Msre_Desc} ${ing.Long_Desc}`
                   }
                </li>
                 ))}
              </ol>
            </Col>
          </Panel>
          <Panel>
            <h4>Instructions</h4>
            <div className="panel-body">
              <Editor editorState={editorState} readOnly className="view-recipe" />
            </div>
          </Panel>
          {/*
          <Panel>
            <h4> Nutrition </h4>
            <Row className="text-center">
              { ShowNutritionSummary(recipe) }
            </Row>
          </Panel>
          */}
          <Panel>
            <h4>Responses</h4>
            <Comments postId={recipe._id} postType={constants.PostTypes.Recipe.name} loggedUserId={loggedUserId} />
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

export default withTracker((args) => {
  // const subscription = Meteor.subscribe('orders.orderDetails', args.match.params._id);
  const subscription = Meteor.subscribe('recipes.view', args.match.params._id);

  const recipe = Recipes.findOne({ _id: args.match.params._id });

  return {
    loading: !subscription.ready(),
    recipe,
    history: args.history,
    loggedInUserId: args.loggedInUserId,
    loggedInUser: args.loggedInUser,
  };
})(ViewRecipe);

/*
import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import Recipes from '../../../api/Recipes/Recipes';
import ViewRecipe from '../../pages/Recipes/ViewRecipe';
import Loading from '../../components/Loading/Loading';

const composer = (args, onData) => {
  const subscription = Meteor.subscribe('recipes.view', args.match.params._id);

  if (subscription.ready()) {
    const recipe = Recipes.findOne();
    onData(null, { recipe, history:args.history });
  }
};

export default composeWithTracker(composer, Loading)(ViewRecipe);
*/


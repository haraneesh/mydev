import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { Editor, EditorState } from 'draft-js';
import { stateFromHTML } from 'draft-js-import-html';
import {
  Button, Panel, Row, Col,
} from 'react-bootstrap';
import { withTracker } from 'meteor/react-meteor-data';
import { toast } from 'react-toastify';
import Recipes from '../../../api/Recipes/Recipes';
import constants from '../../../modules/constants';
import { removeRecipe } from '../../../api/Recipes/methods';
import Loading from '../../components/Loading/Loading';
import Comments from '../../containers/Comments/getComments';
import NotFound from '../Miscellaneous/NotFound/NotFound';
import { RecipeImageViewHero } from '../../components/ImageUpload/ImageUpload';

class ViewRecipe extends React.Component {
  componentDidMount() {
    const { recipe } = this.props;
    const loggedInUser = this.props.loggedInUserId;
    if (recipe && recipe.owner === loggedInUser) {
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
          toast.error(error.reason);
        } else {
          toast.success('Recipe deleted!');
          this.props.history.push('/recipes');
        }
      });
    }
  }

  render() {
    const { recipe } = this.props;
    const loggedUserId = this.props.loggedInUserId;
    const isOwner = (recipe.owner === loggedUserId);
    const editorState = EditorState.createWithContent(stateFromHTML(recipe.description));

    if (recipe.publishStatus !== constants.PublishStatus.Draft.name) {
      return (
        <div className="ViewRecipe">
          <div className="page-header clearfix">
            <h2 className="text-center col-xs-12">{recipe.title}</h2>
            <Col xs={12} className="buttonRowSpacing">
              {isOwner && <Button bsSize="small" href={`/recipes/${recipe._id}/edit`}>Edit</Button>}
            </Col>
          </div>

          {recipe.imageId && (
          <Panel>
            <RecipeImageViewHero cloudImageId={recipe.imageId} />
          </Panel>
          )}

          <Panel style={{ padding: '1rem' }}>
            <Row>
              <Col xs={3} style={{ marginBottom: '1rem' }}>Serves:</Col>
              <Col xs={3} style={{ marginBottom: '1rem' }}>{recipe.serves}</Col>

              <Col xs={3} style={{ marginBottom: '1rem' }}>Level:</Col>
              <Col xs={3} style={{ marginBottom: '1rem' }}>{`${recipe.cookingLevel}`}</Col>

              <Col xs={3} style={{ marginBottom: '1rem' }}>Prep time:</Col>
              <Col xs={3} style={{ marginBottom: '1rem' }}>{(recipe.prepTimeInMins > 0) ? `${recipe.prepTimeInMins} mins` : 'No'}</Col>

              <Col xs={3} style={{ marginBottom: '1rem' }}>Cook time:</Col>
              <Col xs={3} style={{ marginBottom: '1rem' }}>{`${recipe.cookingTimeInMins} mins`}</Col>
            </Row>
          </Panel>

          <Panel className="ingredientsView">
            <h4 style={{ padding: '0 1rem' }}>Ingredients</h4>
            <Col xs={12}>
              <ol>
                {recipe.ingredients.map((ing, index) => (
                  <li key={`ingredient-${index}`} style={{ paddingTop: '3px' }}>
                    {`${ing.measure} ${constants.UnitOfRecipes[ing.unit].display_value} ${ing.name}`}
                  </li>
                ))}
              </ol>
            </Col>
          </Panel>

          <Panel>
            <h4 style={{ padding: '0 1rem' }}>Instructions</h4>
            <div className="panel-body" style={{ paddingLeft: '1.5em' }}>
              <Editor editorState={editorState} readOnly className="view-recipe" />
            </div>
          </Panel>

          <Panel>
            <h4 style={{ padding: '0 1rem' }}>Responses</h4>
            <Comments
              postId={recipe._id}
              postType={constants.PostTypes.Recipe.name}
              loggedUserId={loggedUserId}
            />
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

const ViewRecipeWrapper = (props) => (props.loading ? (<Loading />)
  : (props.recipe) ? (<ViewRecipe {...props} />) : (<NotFound />));

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
})(ViewRecipeWrapper);

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

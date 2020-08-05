import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { withTracker } from 'meteor/react-meteor-data';
import { Row, Col, Button } from 'react-bootstrap';
import RecipeCollection from '../../../api/Recipes/Recipes';
import RecipesList from '../../components/Recipes/RecipesList';
import Loading from '../../components/Loading/Loading';
import { getScrollPercent } from '../../../modules/infiniteScroll';
import constants from '../../../modules/constants';
import { isLoggedInUserAdmin } from '../../../modules/helpers';

// import RecipesList from '../../containers/Recipes/RecipesList.js';

const limit = new ReactiveVar(constants.InfiniteScroll.DefaultLimit);

class Recipes extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleScroll = this.handleScroll.bind(this);
    this.firstCall = true;
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  shouldComponentUpdate(nextProps) {
    const { loading, count } = nextProps;
    if (loading) {
      return false;
    }

    if (this.firstCall) {
      this.firstCall = false;
      // whatever be the count show first view
      return true;
    }

    return count > 0;
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll(e) {
    if (e) e.preventDefault();
    if (getScrollPercent() > 50) {
      limit.set(limit.get() + constants.InfiniteScroll.LimitIncrement);
    }
  }

  render() {
    const { loading, count, recipes, history } = this.props;
    const isAdmin = isLoggedInUserAdmin();

    return (!loading ? (
      <div className="Recipes">
        <Row>
          <Col xs={12}>
            <div className="page-header clearfix">
              <h3 className="pull-left">Recipes</h3>
              { isAdmin && <Button
                bsStyle="primary"
                className="pull-right"
                href="/recipes/new"
              >New Recipe</Button> }
            </div>
            <RecipesList recipes={recipes} count={count} history={history} />
          </Col>
        </Row>
      </div>
    ) : <Loading />);
  }
}

Recipes.propTypes = {
  recipes: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
};

export default withTracker(({ match }) => {
  const subscription =
    Meteor.subscribe('recipes.list', {
      sort: { createdAt: constants.Sort.DESCENDING },
      recipeCategory: match.params.category,
      limit: limit.get(),
    },
  );

  /*
  const recipesC = RecipeCollection.find({}, {
    sort: { createdAt: constants.Sort.ASCENDING },
    limit: limit.get(),
  }); */

  const recipesC = RecipeCollection.find({});
  const recipes = recipesC.fetch();
  const count = recipesC.count();

  return {
    loading: !subscription.ready(),
    recipes,
    count,
  };
})(Recipes);

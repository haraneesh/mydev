import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { createContainer } from 'meteor/react-meteor-data';
import { Row, Col, Button } from 'react-bootstrap';
import RecipeCollection from '../../../api/Recipes/Recipes';
import RecipesList from '../../components/Recipes/RecipesList';
import Loading from '../../components/Loading/Loading';
import { getScrollPercent } from '../../../modules/infiniteScroll';
import constants from '../../../modules/constants';

// import RecipesList from '../../containers/Recipes/RecipesList.js';

const limit = new ReactiveVar(constants.InfiniteScroll.DefaultLimit);

class Recipes extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  shouldComponentUpdate(nextProps) {
    const { loading, count } = nextProps;
    if (loading || count === 0) {
      return false;
    }
    return count > 0;
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll(e) {
    if (e) e.preventDefault();
    if (getScrollPercent() > 50) {
      limit.set(limit.get() + constants.InfiniteScroll.LimitIncrement );
    }
  }

  render() {
    const { loading, count, recipes, history } = this.props;
    return (!loading ? (
      <div className="Recipes">
        <Row>
          <Col xs={12}>
            <div className="page-header clearfix">
              <h3 className="pull-left">Recipes</h3>
              <Button
                bsStyle="primary"
                className="pull-right"
                href="/recipes/new"
              >New Recipe</Button>
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

export default createContainer(() => {
  const subscriptionsReady = [
    Meteor.subscribe('recipes.list', {
      sort: { createdAt: constants.Sort.DESCENDING },
      limit: limit.get(),
    },
  )].every(subscription => subscription.ready());

  const cursor = RecipeCollection.find({}, {
    sort: { createdAt: 1 },
    limit: limit.get(),
  });

  return {
    loading: !subscriptionsReady,
    recipes: cursor && cursor.fetch(),
    count: cursor && cursor.count(),
  };
}, Recipes);

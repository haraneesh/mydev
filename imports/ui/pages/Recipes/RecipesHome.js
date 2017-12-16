import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Panel, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Glyphicon, Image } from 'react-bootstrap';
import Loading from '../../components/Loading/Loading';
import constants from '../../../modules/constants';
import { isLoggedInUserAdmin } from '../../../modules/helpers';

import './RecipesHome.scss';

const catImageSection = (name, classname) => (
  <Col xs={12} sm={8} className={classname}>
    <Image src={`/recipes/${name}.jpg`} responsive />
  </Col>
);

const catNameSection = (name, displayName, recipeCount, index) => (
  <Col xs={12} sm={4} className="text-center">
    <div className={`catName catName${index}`}>
      <div><Glyphicon glyph="leaf" /></div>
      <div>{displayName.toUpperCase()}</div>
      <div><small>{`${(recipeCount) || 0} recipes`}</small></div>
    </div>
  </Col>
);

const recipeHomeCategoryRow = (name, displayName, recipeCount, index) => (<Panel>
  <Row className="rowCategory">
    <Link to={`/recipes/foodType/${name}`}>
      <div className={`recipe${name}`}>
        {catImageSection(name, (index % 2 === 0) ? 'pull-right' : 'pull-left')}
        {catNameSection(name, displayName, recipeCount, index % 4)}
      </div></Link>
  </Row>
</Panel>);

export default class RecipesHome extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { recipeCounts: {} };
    this.loading = true;
  }

  componentDidMount() {
    Meteor.call('recipes.countByCategory', (error, success) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        this.loading = false;
        const recipeCounts = [];
        success.forEach((row) => {
          recipeCounts[row._id.typeOfFood] = row.count;
        });
        this.setState({ recipeCounts });
      }
    });
  }

  render() {
    const isAdmin = isLoggedInUserAdmin();
    const loading = this.loading;
    const { recipeCounts } = this.state;
    const foodTypes = constants.FoodTypes;
    const foodTypeNames = constants.FoodTypes.names;

    return (!loading ? (
      <div className="RecipesHome">
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
          </Col>
        </Row>
        {
          foodTypeNames.map((name, index) => (
             recipeHomeCategoryRow(name, foodTypes[name].displayName, recipeCounts[name], index)
            ),
          )
        }
      </div>
    ) : <Loading />);
  }
}

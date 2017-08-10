import React from 'react';
import { Row, Col } from 'react-bootstrap';
import EditSpecial from '../../components/Specials/EditSpecial';
import AddSpecial from '../../components/Specials/AddSpecial';
// import RecipesList from '../../containers/recipes/RecipesList.js';

const EditAllSpecials = ({ specials, history }) => {
  const specialsDisplay = [];
  specials.map((special, index) => {
    specialsDisplay.push(
      <EditSpecial special={special} history={history} key={`specialCard-${index}`} />,
     );
  });

  return (
    <div className="EditSpecials">
      <Row>
        <Col xs={12}>
          <h3 className="page-header">Edit Specials</h3>
        </Col>
        <Col xs={12}>
          <AddSpecial />
        </Col>
        <Col xs={12}>
          {(specials.length > 0) && specialsDisplay }
        </Col>
      </Row>
    </div>
  );
};

export default EditAllSpecials;

import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
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
          <h2 className="py-4">Edit Specials</h2>
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

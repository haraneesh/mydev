import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { Editor, convertFromRaw, EditorState } from 'draft-js';
// import RecipesList from '../../containers/recipes/RecipesList.js';

const renderCard = (specials) => (
  specials.map((special, index) => {
    const contentState = convertFromRaw(special.description);
    const editorState = EditorState.createWithContent(contentState);

    return (
      <Row className={`specialCard-${special.colorTheme}`} key={`specialCard-${index}`}>
        <Row className="b-body m-2 p-2">
          <Col sm={6}>
            {' '}
            <div className="view-specials-image" style={{ backgroundImage: `url('${special.imageUrl}')` }} />
            {' '}
          </Col>
          <Col sm={6}>
            <Row>
              <Col sm={12}>
                <h2 className="special-head">{special.title}</h2>
                <div>
                  <Editor editorState={editorState} readOnly />
                </div>
              </Col>
              <Col sm={12}>
                <Button variant="secondary" className="pull-left" href="/order"> &nbsp;Buy&nbsp; </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Row>
    );
  })
);

const ListSpecials = ({ specials }) => (
  <div className="ListSpecials">
    <Row>
      <Col xs={12}>
        <h2 className="py-4">Specials</h2>
      </Col>
      <Col xs={12}>
        { (specials.length > 0) ? renderCard(specials) : (<Alert variant="info">We do not have any specials right now.</Alert>)}

      </Col>
    </Row>
  </div>
);

export default ListSpecials;

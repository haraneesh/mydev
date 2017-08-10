import React from 'react';
import { Panel, Row, Col, Button, Alert } from 'react-bootstrap';
import { Editor, convertFromRaw, EditorState } from 'draft-js';
// import RecipesList from '../../containers/recipes/RecipesList.js';

const renderCard = specials => (
  specials.map((special, index) => {
    const contentState = convertFromRaw(special.description);
    const editorState = EditorState.createWithContent(contentState);

    return (
      <Panel className={`specialCard-${special.colorTheme}`} key={`specialCard-${index}`}>
        <Panel className="card" >
          <Row>
            <Col sm={6} > <div className="view-specials-image" style={{ backgroundImage: `url('${special.imageUrl}')` }} /> </Col>
            <Col sm={6} >
              <Row>
                <Col sm={12}>
                  <h3 className="special-head">{special.title}</h3>
                  <div>
                    <Editor editorState={editorState} readOnly />
                  </div>
                </Col>
                <Col sm={12}>
                  <Button bsStyle="primary" className="pull-left" href="/order"> &nbsp;Buy&nbsp; </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Panel>
      </Panel>
    );
  })
);

const ListSpecials = ({ specials }) => (
  <div className="ListSpecials">
    <Row>
      <Col xs={12}>
        <h3 className="page-header">Specials</h3>
      </Col>
      <Col xs={12}>
        { (specials.length > 0) ? renderCard(specials) : (<Alert bsStyle="info">We do not have any specials right now.</Alert>)}

      </Col>
    </Row>
  </div>
  );

export default ListSpecials;

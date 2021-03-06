import React from 'react';
import {
  Row, Col, Button, FormGroup, FormControl,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { upsertSpecialDraft } from '../../../api/Specials/methods';
import constants from '../../../modules/constants';

const addNewSpecial = () => {
  const special = {
    title: document.querySelector('[name="title"]').value.trim(),
    colorTheme: constants.SpecialThemes[0],
  };
  upsertSpecialDraft.call(special, (error, msg) => {
    if (error) {
      toast.error(error.reason);
    }
  });
};

const AddSpecial = () => (
  <FormGroup>
    <Row>
      <Col xs={10}>
        <FormControl
          type="text"
          name="title"
          placeholder="Title of the special announcement"
        />
      </Col>
      <Col xs={2}>
        <Button type="submit" onClick={addNewSpecial}>Add New </Button>
      </Col>
    </Row>
  </FormGroup>
);

export default AddSpecial;

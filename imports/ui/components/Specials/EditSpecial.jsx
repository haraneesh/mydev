import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import RichTextEditor, { EditorValue } from 'react-rte';
import { convertToRaw, convertFromRaw, EditorState } from 'draft-js';
import { toast } from 'react-toastify';
import { stateToHTML } from 'draft-js-export-html';
import { stateFromHTML } from 'draft-js-import-html';
import constants from '../../../modules/constants';
import { upsertSpecialDraft, upsertSpecialPublish, removeSpecial } from '../../../api/Specials/methods';
import FieldGroup from '../Common/FieldGroup';

function EditSpecial({ special }) {
  // Declare a new state variable, which we'll call "count"
  const [specialState, setSpecialState] = useState(special);
  const [descriptionValue, setDescriptionValue] = useState(RichTextEditor.createEmptyValue());

  function onRichTextEditorChange(v) {
    setDescriptionValue(v);
  }

  function onValueChange(event) {
    // +Text converts it to a number
    const speciall = { ...specialState };
    speciall[event.target.name] = (event.target.name === 'displayOrder')
      ? +event.target.value
      : event.target.value;

    setSpecialState(speciall);
  }

  function initialize() {
    let editorValue = RichTextEditor.createEmptyValue();
    if (special && special.description) {
      editorValue = EditorValue.createFromState(
        EditorState.createWithContent(
          stateFromHTML(special.description),
        ),
      );
    }

    setDescriptionValue(editorValue);
  }

  useEffect(() => {
    initialize();
  }, []);

  function deleteSpecial() {
    if (confirm('Are you sure, you want to delete this special announcement? This is permanent!')) {
      removeSpecial.call({ specialId: special._id }, (err) => {
        if (err) {
          toast.error(err.reason);
        } else {
          toast.success('Special Announcement has been deleted!');
        }
      });
    }
  }

  function updateSpecial(speciall, publishStatus) {
    const upsertSpecial = (publishStatus === constants.PublishStatus.Published.name)
      ? upsertSpecialPublish : upsertSpecialDraft;

    upsertSpecial.call(speciall, (error, msg) => {
      if (error) {
        toast.error(error.reason);
      } else {
        const message = `Changes to Special Announcement ${speciall.title} have been Saved!`;
        toast.success(message);
      }
    });
  }

  function saveOrUpdateSpecial(event, publishStatus) {
    const speciall = { ...specialState };

    speciall.description = stateToHTML(
      descriptionValue.getEditorState().getCurrentContent(),
    );

    updateSpecial(speciall, publishStatus);
  }

  if (specialState) {
    const label = (specialState.publishStatus === constants.PublishStatus.Published.name) ? 'label-success' : 'label-info';

    return (
      <Row className={`specialCard-${specialState.colorTheme}`} className="bg-body m-2 p-2">
        <Row>
          <Col xs={12}>
            <h4 className={`label ${label}`}>
              Status
              {' '}
              {specialState.publishStatus}
            </h4>
          </Col>
          <Col sm={6}>
            <Row>
              <FieldGroup
                controlType="text"
                controlLabel="Image Url"
                controlName="imageUrl"
                defaultValue={specialState && specialState.imageUrl}
                displayControlName="true"
                updateValue={onValueChange}
              />
            </Row>
            <div
              className="view-specials-image"
              style={{ backgroundImage: `url('${specialState.imageUrl}')` }}
            />
          </Col>
          <Col sm={6}>
            <Row>
              <Col sm={12}>

                <FieldGroup
                  controlType="text"
                  controlLabel="Title"
                  controlName="title"
                  defaultValue={special && specialState.title}
                  displayControlName="true"
                  updateValue={onValueChange}
                />

                <div className="special-body">
                  <Row>
                    <h4>Description</h4>
                    <RichTextEditor
                      value={descriptionValue} // specialState.value
                      onChange={onRichTextEditorChange}
                      toolbarConfig={constants.RichEditorToolbarConfig}
                      placeholder="Type Special Announcement Text"
                      className="richTextEditor"
                    />
                  </Row>

                  <FieldGroup
                    controlType="select"
                    controlLabel="Color Theme"
                    controlName="colorTheme"
                    defaultValue={specialState.colorTheme}
                    options={constants.SpecialThemes}
                    displayControlName="true"
                    updateValue={onValueChange}
                  />

                </div>
              </Col>
              <Col sm={12}>
                <FieldGroup
                  controlType="number"
                  controlLabel="Display Order"
                  controlName="displayOrder"
                  defaultValue={specialState.displayOrder}
                  displayControlName="true"
                  updateValue={onValueChange}
                />
              </Col>
            </Row>
          </Col>
        </Row>

        <Row className="text-right">
          <Button size="sm" type="submit" variant="secondary" onClick={(event) => saveOrUpdateSpecial(event, constants.PublishStatus.Published.name)}>
            Save and Publish
          </Button>

          <Button size="sm" type="submit" onClick={(event) => saveOrUpdateSpecial(event, constants.PublishStatus.Draft.name)}>
            Save as Draft
          </Button>

          <Button size="sm" onClick={deleteSpecial}>Delete</Button>
        </Row>
      </Row>
    );
  }
  return (<div />);
}

export default EditSpecial;

EditSpecial.propTypes = {
  special: PropTypes.object.isRequired,
};

import React from 'react';
import { FormGroup, Button, ButtonToolbar, Panel, Row, Col } from 'react-bootstrap';
import RichTextEditor, { EditorValue } from 'react-rte';
import { convertToRaw, convertFromRaw, EditorState } from 'draft-js';
import { upsertSpecialDraft, upsertSpecialPublish, removeSpecial } from '../../../api/Specials/methods';
import { Bert } from 'meteor/themeteorchef:bert';
import constants from '../../../modules/constants';
import PropTypes from 'prop-types';
import FieldGroup from '../Common/FieldGroup';


export default class EditSpecial extends React.Component {
  constructor(props, context) {
    super(props, context);
    this._initialize(this.props.special, true);

    this.saveOrUpdateSpecial = this.saveOrUpdateSpecial.bind(this);
    this.onRichTextEditorChange = this.onRichTextEditorChange.bind(this);
    this.deleteSpecial = this.deleteSpecial.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
  }

  _initialize(special) {
    let editorValue;
    if (special && special.description) {
      const contentState = convertFromRaw(special.description);
      const editorState = EditorState.createWithContent(contentState);
      editorValue = new EditorValue(editorState);
    }

    const { _id, title, description, imageUrl, displayOrder, colorTheme } = special;
    this.special = { _id, title, description, imageUrl, displayOrder, colorTheme };

    this.state = {
      value: (editorValue) || RichTextEditor.createEmptyValue(),
    };
  }

  onRichTextEditorChange(value) {
    this.setState({ value });
  }

  onValueChange(event) {
    // +Text converts it to a number
    this.special[event.target.name] = (event.target.name === 'displayOrder') ? +event.target.value : event.target.value;
  }

  deleteSpecial() {
    if (confirm('Are you sure, you want to delete this special announcement? This is permanent!')) {
      removeSpecial.call({ specialId: this.props.special._id }, (err) => {
        if (err) {
          Bert.alert(err.reason, 'danger');
        } else {
          Bert.alert('Special Announcement has been deleted!', 'success');
        }
      });
    }
  }

  saveOrUpdateSpecial(event, publishStatus) {
    const editorState = this.state.value.getEditorState();
    const contentState = editorState.getCurrentContent();

    this.special.description = convertToRaw(contentState);
    this.updateSpecial(this.special, publishStatus);
  }

  updateSpecial(special, publishStatus) {
    const upsertSpecial = (publishStatus === constants.PublishStatus.Published.name) ?
    upsertSpecialPublish : upsertSpecialDraft;
    upsertSpecial.call(special, (error, msg) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const message = `Changes to Special Announcement ${this.props.special.title} have been Saved!`;
        Bert.alert(message, 'success');
      }
    });
  }

  render() {
    const { special } = this.props;
    const label = (special.publishStatus === constants.PublishStatus.Published.name)?'label-success':'label-info';
    if (special) {
      return (
        <Panel className={`specialCard-${special.colorTheme}`}>
          <Panel className="card">
            <Row>
              <Col xs={12}>
                <h4 className={`label ${label}`}>Status {special.publishStatus}</h4>
              </Col>
              <Col sm={6} >
                <FormGroup>
                  <FieldGroup
                    controlType="text"
                    controlLabel="Image Url"
                    controlName="imageUrl"
                    defaultValue={special && special.imageUrl}
                    displayControlName="true"
                    updateValue={this.onValueChange}
                  />
                </FormGroup>
                <div className="view-specials-image" style={{ backgroundImage: `url('${special.imageUrl}')` }} />

              </Col>
              <Col sm={6} >
                <Row>
                  <Col sm={12}>

                    <FieldGroup
                      controlType="text"
                      controlLabel="Title"
                      controlName="title"
                      defaultValue={special && special.title}
                      displayControlName="true"
                      updateValue={this.onValueChange}
                    />

                    <div className="special-body">
                      <FormGroup>
                        <h4>Description</h4>
                        <RichTextEditor
                          value={this.state.value}
                          onChange={this.onRichTextEditorChange}
                          toolbarConfig={constants.RichEditorToolbarConfig}
                          placeholder="Type Special Announcement Text"
                          className="richTextEditor"
                        />
                      </FormGroup>

                      <FieldGroup
                        controlType="select"
                        controlLabel="Color Theme"
                        controlName="colorTheme"
                        defaultValue={this.special.colorTheme}
                        options={constants.SpecialThemes}
                        displayControlName="true"
                        updateValue={this.onValueChange}
                      />

                    </div>
                  </Col>
                  <Col sm={12}>
                    <FieldGroup
                      controlType="number"
                      controlLabel="Display Order"
                      controlName="displayOrder"
                      defaultValue={special.displayOrder}
                      displayControlName="true"
                      updateValue={this.onValueChange}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>

            <ButtonToolbar >
              <Button bsSize="small" className="pull-right" type="submit" bsStyle="primary" onClick={event => this.saveOrUpdateSpecial(event, constants.PublishStatus.Published.name)}>
                Save and Publish
             </Button>

              <Button bsSize="small" className="pull-right" type="submit" onClick={event => this.saveOrUpdateSpecial(event, constants.PublishStatus.Draft.name)}>
                 Save as Draft
              </Button>

              <Button bsSize="small" onClick={this.deleteSpecial}>Delete</Button>
            </ButtonToolbar>

          </Panel>
        </Panel>
      );
    }
  }
}

EditSpecial.propTypes = {
  special: PropTypes.object.isRequired,
};

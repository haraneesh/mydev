import { Meteor } from 'meteor/meteor';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup, Button, ButtonToolbar, Row, Col,
} from 'react-bootstrap';
import RichTextEditor, { EditorValue } from 'react-rte';
import { EditorState } from 'draft-js';
import { toast } from 'react-toastify';
import { stateToHTML } from 'draft-js-export-html';
import { stateFromHTML } from 'draft-js-import-html';
import constants from '../../../modules/constants';
import FieldGroup from '../Common/FieldGroup';

import './ProductDetails.scss';

function EditProductDetails({ productId, closeFunction }) {
  // Declare a new state variable, which we'll call "count"
  const [productDetailsState, setProductDetailsState] = useState({});
  const [descriptionValue, setDescriptionValue] = useState(RichTextEditor.createEmptyValue());

  function onRichTextEditorChange(v) {
    setDescriptionValue(v);
  }

  function onValueChange(event) {
    // +Text converts it to a number
    const productDetailsl = { ...productDetailsState };
    productDetailsl[event.target.name] = (event.target.name === 'displayOrder')
      ? +event.target.value
      : event.target.value;

    setProductDetailsState(productDetailsl);
  }

  function initialize() {
    Meteor.call('productDetails.getProductDetails', productId, (error, productDetails) => {
      if (error) {
        toast.error(error.reason);
      } else {
        let editorValue = RichTextEditor.createEmptyValue();
        if (productDetails && productDetails.description) {
          editorValue = EditorValue.createFromState(
            EditorState.createWithContent(
              stateFromHTML(productDetails.description),
            ),
          );
        }
        setProductDetailsState({ ...{ productId }, ...productDetails });
        setDescriptionValue(editorValue);
      }
    });
  }

  useEffect(() => {
    initialize();
  }, []);

  function deleteProductDetails() {
    if (confirm('Are you sure, you want to delete this Product\'s Details? This is permanent!')) {
      Meteor.call('productDetails.removeProductDetails', productDetailsState.productId,
        (err) => {
          if (err) {
            toast.error(err.reason);
          } else {
            toast.success('Product\'s details have been deleted!');
            closeFunction();
          }
        });
    }
  }

  function updateProductDetails(productDetailsNew) {
    Meteor.call('productDetails.upsertProductDetails', productDetailsNew, (error) => {
      if (error) {
        toast.error(error.reason);
      } else {
        const message = 'Product\'s Details have been Saved!';
        toast.success(message);
      }
    });
  }

  function saveOrUpdateProductDetails() {
    const productDetailsl = { ...productDetailsState };

    productDetailsl.description = stateToHTML(
      descriptionValue.getEditorState().getCurrentContent(),
    );

    updateProductDetails(productDetailsl);
  }

  if (productDetailsState) {
    return (
      <Row className={`productDetailsCard-${productDetailsState.colorTheme}`}>
        <div className="card">
          <Col sm={12}>
            <FormGroup>
              <FieldGroup
                controlType="text"
                controlLabel="Image Url"
                controlName="imageUrl"
                defaultValue={productDetailsState && productDetailsState.imageUrl}
                displayControlName="true"
                updateValue={onValueChange}
              />
            </FormGroup>
            <div
              className="view-productDetailss-image"
              style={{ backgroundImage: `url('${productDetailsState.imageUrl}')` }}
            />
          </Col>

          <Col sm={12}>

            <FieldGroup
              controlType="text"
              controlLabel="Title"
              controlName="title"
              defaultValue={productDetailsState && productDetailsState.title}
              displayControlName="true"
              updateValue={onValueChange}
            />

            <FormGroup>
              <h4>Description</h4>
              <RichTextEditor
                value={descriptionValue} // productDetailsState.value
                onChange={onRichTextEditorChange}
                toolbarConfig={constants.RichEditorToolbarConfig}
                placeholder="Type Special Announcement Text"
                className="richTextEditor"
              />
            </FormGroup>
          </Col>
        </div>

        <ButtonToolbar>
          <Button
            bsSize="small"
            className="pull-right"
            type="submit"
            onClick={saveOrUpdateProductDetails}
          >
            Save
          </Button>

          <Button bsSize="small" onClick={deleteProductDetails}>Delete</Button>
        </ButtonToolbar>
      </Row>

    );
  }
  return (<div />);
}

export default EditProductDetails;

EditProductDetails.propTypes = {
  productId: PropTypes.string.isRequired,
};

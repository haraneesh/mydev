import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { toast } from 'react-toastify';

import RichTextEditor from '/imports/ui/components/RichTextEditor/RichTextEditor';

import FieldGroup from '/imports/ui/components/Common/FieldGroup';

function EditProductDetails({ productId, closeFunction }) {
  // Declare a new state variable, which we'll call "count"
  const [productDetailsState, setProductDetailsState] = useState({});
  const [descriptionValue, setDescriptionValue] = useState('<div></div>');

  function onValueChange(event) {
    // +Text converts it to a number
    const productDetailsl = { ...productDetailsState };
    productDetailsl[event.target.name] =
      event.target.name === 'displayOrder'
        ? +event.target.value
        : event.target.value;

    setProductDetailsState(productDetailsl);
  }

  function initialize() {
    Meteor.call(
      'productDetails.getProductDetails',
      productId,
      (error, productDetails) => {
        if (error) {
          toast.error(error.reason);
        } else {
          setProductDetailsState({ ...{ productId }, ...productDetails });
          setDescriptionValue(productDetails.description);
        }
      },
    );
  }

  useEffect(() => {
    initialize();
  }, []);

  function deleteProductDetails() {
    if (
      confirm(
        "Are you sure, you want to delete this Product's Details? This is permanent!",
      )
    ) {
      Meteor.call(
        'productDetails.removeProductDetails',
        productDetailsState.productId,
        (err) => {
          if (err) {
            toast.error(err.reason);
          } else {
            toast.success("Product's details have been deleted!");
            closeFunction();
          }
        },
      );
    }
  }

  async function updateProductDetails(productDetailsNew) {
    try {
      await Meteor.callAsync(
        'productDetails.upsertProductDetails',
        productDetailsNew,
      );
      const message = "Product's Details have been Saved!";
      toast.success(message);
    } catch (error) {
      toast.error(error.reason);
    }
  }

  function onRichTextEditorChange(descriptionValue) {
    setDescriptionValue(descriptionValue);
  }

  function saveOrUpdateProductDetails() {
    const productDetailsl = { ...productDetailsState };

    productDetailsl.description = descriptionValue;

    updateProductDetails(productDetailsl);
  }

  if (productDetailsState) {
    return (
      <Row className={`productDetailsCard-${productDetailsState.colorTheme}`}>
        <Col xs={12}>
          <Row>
            <FieldGroup
              controlType="text"
              controlLabel="Image Url"
              controlName="imageUrl"
              defaultValue={productDetailsState && productDetailsState.imageUrl}
              displayControlName="true"
              updateValue={onValueChange}
            />
          </Row>
          <div
            className="view-productDetailss-image"
            style={{
              backgroundImage: `url('${productDetailsState.imageUrl}')`,
            }}
          />
        </Col>

        <Col xs={12}>
          <FieldGroup
            controlType="text"
            controlLabel="Title"
            controlName="title"
            defaultValue={productDetailsState && productDetailsState.title}
            displayControlName="true"
            updateValue={onValueChange}
          />

          <Row>
            <h4>Description</h4>
            <RichTextEditor
              nameSpace="product_details"
              savedHTMLCode={descriptionValue}
              onChange={onRichTextEditorChange}
            />
          </Row>
        </Col>

        <Col className="text-end">
          <Button
            size="sm"
            type="submit"
            className="btn-block col-2 me-1"
            onClick={saveOrUpdateProductDetails}
          >
            Save
          </Button>

          <Button
            size="sm"
            className="btn-block col-2"
            onClick={deleteProductDetails}
          >
            Delete
          </Button>
        </Col>
      </Row>
    );
  }
  return <div />;
}

export default EditProductDetails;

EditProductDetails.propTypes = {
  productId: PropTypes.string.isRequired,
};

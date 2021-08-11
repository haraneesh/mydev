import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';
import { Row, Col, Panel } from 'react-bootstrap';
import Loading from '../../components/Loading/Loading';

function ZohoUpdateReturnables() {
  const [returnableProducts, setReturnableProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Meteor.call('products.getReturnables', (error, products) => {
      if (error) {
        toast.error(error.reason);
      } else {
        setReturnableProducts(products);
      }
      setLoading(false);
    });
  }, []);

  function prepareUnitUpdateObject() {

  }

  function processFile(uplLoadCntrlId, zh_item_id) {
    const fileCtrl = document.getElementById(uplLoadCntrlId);
    const fileToProcess = fileCtrl.files[0];

    const reader = new FileReader();

    reader.onload = function (evt) {
      console.log(evt.target.result);
    };

    reader.readAsText(fileToProcess);
  }

  function validateFile(e) {
    const fileExtension = e.target.files[0].type;

    if (fileExtension !== 'text/csv') {
      toast.error('Please select a csv file, this file has invalid extensions');
      e.target.value = '';
      return false;
    }
    return true;
  }

  function showUploadRows(product, index) {
    return (
      <Panel>
        <Row>
          <Col sm={4}>
            {`${index + 1}.   ${product.name}`}
          </Col>
          <Col xs={6}>
            <input
              type="file"
              id={`file_${product._id}`}
              accept="text/csv"
              onChange={validateFile}
            />
          </Col>
          <Col sm={2}>
            <button
              type="button"
              className="btn btn-default"
              id={`btn_${product._id}`}
              onClick={() => { processFile(`file_${product._id}`, product.zh_item_id); }}
            >
              Process
            </button>
          </Col>
        </Row>
      </Panel>
    );
  }

  return loading
    ? (<Loading />)
    : (
      <div>
        <h3 className="page-header">Update Returnable Products</h3>
        {returnableProducts.map((product, index) => showUploadRows(product, index))}
      </div>
    );
}

export default ZohoUpdateReturnables;

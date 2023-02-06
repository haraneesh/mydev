import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import { toast } from 'react-toastify';
import { insertProduct } from '../../../api/Products/methods';
import constants from '../../../modules/constants';

const handleInsertProduct = (event) => {
  const { target } = event;
  const name = document.querySelector('[name="productName"]').value;
  if (name !== '') {
    const unitprice = 0;
    const wSaleBaseUnitPrice = 0;
    const sku = `${name}-number`;
    const unitOfSale = '1Kg';
    const description = '';
    const image_path = '/blank_image.png';
    const type = constants.ProductType[0]; // New
    const availableToOrder = false;
    const availableToOrderWH = false;
    const maxUnitsAvailableToOrder = 99999;
    const vendor_details = {
      id: 1,
      slug: 'healthy-farm-foods',
      name: 'Healthy Farm Foods',
    };

    insertProduct.call({
      sku,
      name,
      unitOfSale,
      wSaleBaseUnitPrice,
      maxUnitsAvailableToOrder,
      unitprice,
      description,
      image_path,
      type,
      availableToOrder,
      availableToOrderWH,
      vendor_details,
    }, (error) => {
      if (error) {
        toast.error(error.reason);
      } else {
        toast.success('Product has been added!');
      }
    });
  } else {
    toast.info('Type in a Product Name.');
  }
};

const InsertProduct = () => (
  <Row className="px-2">
    <Col>
      <Form.Control
        type="text"
        placeholder="Type a product title and press Add Product button"
        name="productName"
      />
    </Col>
    <Col xs={5} sm={3} className="text-sm-start">
      <Button onClick={handleInsertProduct} className="btn-block btn-secondary"> Add Product </Button>
    </Col>
  </Row>
);

export default InsertProduct;

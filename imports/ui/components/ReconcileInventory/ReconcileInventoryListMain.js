import React from 'react';
import PropTypes from 'prop-types';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import generateRCInven from '../../../reports/client/GenerateReconcileInventory';
import { getDisplayDate } from '../../../modules/helpers';

const ReturnRows = ({ reconciledList }) => (
  reconciledList.map((item) => {
    const displayDate = getDisplayDate(item.createdAt);
    return (
      <tr key={item._id}>
        <td>
          <Button variant="link" onClick={() => { generateRCInven(item, displayDate); }}>
            {displayDate}
          </Button>
        </td>
      </tr>
    );
  })
);

const ReconcileInventoryListMain = ({ reconciledList }) => (
  <Table striped bordred responsive>
    <thead>
      <tr>
        <th>Created On</th>
      </tr>
    </thead>
    <tbody>
      <ReturnRows reconciledList={reconciledList} />
    </tbody>
  </Table>

);

ReconcileInventoryListMain.propTypes = {
  reconciledList: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ReconcileInventoryListMain;

import { Meteor } from 'meteor/meteor';
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';

const UploadPrices = ({ history, products }) => {
  const refFileInput = useRef();

  const [fileData, setFileData] = useState([]);
  function handleFileSelect() {
    const { current } = refFileInput;
    const file = current.files[0];
    const reader = new FileReader();
    reader.onload = function (file) {
      const rows = file.target.result.split(/[\r\n|\n]+/);
      setFileData(rows);
    };
    reader.readAsText(file);
  }

  function getFileInfo(e) {
    const file = e.target.files[0];
    if (file.name.split('.')[1].toUpperCase() != 'CSV') {
      toast.success('Invalid csv file !');
      e.target.parentNode.reset();
    } else {
      handleFileSelect();
    }
  }

  function updatePricesInBackground() {
    const prepProductPricesForUpdate = [];
    fileData.map((row, rowIndex) => {
      if (rowIndex > 0) {
        const rowSplit = row.split(',');
        if (rowSplit[0] !== '') {
          return prepProductPricesForUpdate.push(
            {
              _id: rowSplit[0],
              name: rowSplit[1],
              unitprice: rowSplit[2],
              wSaleBaseUnitPrice: rowSplit[3],

            },
          );
        }
      }
    });

    Meteor.call('products.bulkUpdatePrices', prepProductPricesForUpdate, (error, success) => {
      if (error) {
        toast.error(error.reason);
      } else {
        toast.success('Prices Updated');
      }
      resetUpload();
    });
  }

  function refreshPage() {
    history.go(0);
  }

  function exportTableToCSV() {
    const csv = [];
    csv.push('Product Id, Product Name, UnitPrice, WholeSalePrice');
    for (let i = 0; i < products.length; i++) {
      const {
        _id, name, unitprice, wSaleBaseUnitPrice,
      } = products[i];
      csv.push(`${_id},${name.replace(/,/g, ' ')},${unitprice},${wSaleBaseUnitPrice}`);
    }
    downloadFile(csv);
  }

  function downloadFile(csv) {
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv.join('\r\n'))}`);
    element.setAttribute('download', 'ProductPricesUpload.csv');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  function resetUpload() {
    const { current } = refFileInput;
    current.value = '';
    setFileData([]);
    setFileInfo('');
  }

  function createTableWithFileData() {
    return (
      <table className="table table-striped">
        <tbody>
          {fileData.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.split(',').map((cell) => (
                <td>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="priceUpload my-2 px-2 row">
      <div className="control-fileupload col">
        {/* <label htmlFor="fileInput" className="form-label"> Upload price file </label> */}
        <input className="form-control" type="file" id="fileInput" ref={refFileInput} onChange={getFileInfo} />
      </div>

      <div className="col-sm col-12 text-sm-start">
        <Button onClick={() => { exportTableToCSV(); }}>Download Template</Button>
        <Button onClick={refreshPage} className="ms-1"> Reload Data </Button>
      </div>

      {/* If file exists */}
      {fileData.length > 0 && (
        <div className="pricesUpdate">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Title>Prices to Update</Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ maxHeight: '700px', overflowY: 'scroll' }}>{createTableWithFileData()}</Modal.Body>

            <Modal.Footer>
              <Button onClick={resetUpload}>Close</Button>
              <Button onClick={updatePricesInBackground}>Update Prices</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </div>
      )}
      <div id="list" />
    </div>
  );
};

UploadPrices.defaultProps = {
  basketDetails: {},
};

UploadPrices.propTypes = {
  history: PropTypes.object.isRequired,
  basketDetails: PropTypes.object,
  loggedInUser: PropTypes.object.isRequired,
};

export default UploadPrices;

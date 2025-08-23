import React from 'react';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import moment from 'moment';
import 'moment-timezone';
import { formatMoney } from 'accounting-js';
import Checkbox from './Checkbox';
import LoadImage from './LoadImage';
import constants from '../../../modules/constants';
import { accountSettings, dateSettings } from '../../../modules/settings';

export class DataListStore {
  constructor(/* List */ rowDataList) {
    this.size = rowDataList.length;
    this._cache = [];

    /* for (let index = 0; index < this.size; index++) {
      this._cache[index] = rowDataList[index];
    } */

    rowDataList.map((rowData) => {
      this._cache.push(rowData);
    });
  }

  getObjectAt(/* number */ index) /* ?object */ {
    if (index < 0 || index > this.size) {
      return undefined;
    }
    return this._cache[index];
  }

  /**
  * Populates the entire cache with data.
  * Use with Caution! Behaves slowly for large sizes
  * ex. 100,000 rows
  */
  getAll() {
    if (this._cache.length < this.size) {
      for (let i = 0; i < this.size; i++) {
        this.getObjectAt(i);
      }
    }
    return this._cache.slice();
  }

  getSize() {
    return this.size;
  }

  setObjectAt(/* number */ index, /* ?object */ obj) {
    if (index < 0 || index > this.size) {
      return;
    }
    this._cache[index] = obj;
  }
}

export const DateCell = ({
  rowIndex, data, columnKey, ...props
}) => (
  <td {...props}>
    {moment(data.getObjectAt(rowIndex)[columnKey]).tz(dateSettings.timeZone).format(dateSettings.format)}
  </td>
);

export const RowSelectedCell = ({
  rowIndex, data, columnKey, onChecked, ...props
}) => {
  const isChecked = data.getObjectAt(rowIndex)[columnKey];
  return (
    <td {...props}>
      <Checkbox
        onChange={(e) => { onChecked(e, rowIndex); e.stopPropagation(); }}
        checked={isChecked}
      />
    </td>

  /* <td {...props} > <input type = "checkbox" onClick = { (e) => { onChecked(e, rowIndex); e.stopPropagation();} }
        /> </td> */
  );
};

export const OrderStatusCell = ({
  rowIndex, data, columnKey, ...props
}) => {
  const order_status = data.getObjectAt(rowIndex)[columnKey];
  const statusObj = order_status ? constants.OrderStatus[order_status] : undefined;
  const labelStyle = statusObj ? statusObj.label : 'secondary';
  const statusToDisplay = statusObj ? statusObj.display_value : (order_status || '--');
  return (
    <td {...props}>
      <Badge bg={labelStyle}>
        { statusToDisplay }
      </Badge>
    </td>
  );
};

export const PorterStatusCell = ({
  rowIndex, data, columnKey, onClick, ...props
}) => {
  const order = data.getObjectAt(rowIndex);
  const porterStatus = order[columnKey] ? order[columnKey] : 'Not_Assigned';
  const labelStyle = constants.PorterStatus[porterStatus].label;
  const statusToDisplay = constants.PorterStatus[porterStatus].display_value;
  return (
    <td {...props}>
      <Button variant={labelStyle} className="text-white" onClick={(e) => { e.stopPropagation(); onClick(order); }}>
        { statusToDisplay }
      </Button>
    </td>
  );
};

export const ImageCell = ({
  rowIndex, data, columnKey, ...props
}) => (
  <td>
    <LoadImage
      src={data.getObjectAt(rowIndex)[columnKey]}
    />
  </td>
);

export const LinkCell = ({
  rowIndex, data, columnKey, callBack, ...props
}) => {
  if (callBack) {
    return (
      <td {...props}>
        <a onClick={(e) => { e.stopPropagation(); callBack(e, rowIndex); }}>{data.getObjectAt(rowIndex)[columnKey]}</a>
      </td>
    );
  }
  return TextCell({
    rowIndex, data, columnKey, ...props,
  });
};

export const TextCell = ({
  rowIndex, data, columnKey, ...props
}) => (
  <td {...props}>
    {data.getObjectAt(rowIndex)[columnKey]}
  </td>
);

export const AmountCell = ({
  rowIndex, data, columnKey, ...props
}) => (
  <td {...props}>
    {formatMoney(data.getObjectAt(rowIndex)[columnKey], accountSettings)}
  </td>
);

// Sortable header columns

export const SortTypes = {
  ASC: 'ASC',
  DESC: 'DESC',
};

function reverseSortDirection(sortDir) {
  return sortDir === SortTypes.DESC ? SortTypes.ASC : SortTypes.DESC;
}

export const SortHeaderCell = ({
  sortDir, cellName, onSortChange, columnKey, ...props
}) => {
  let arrowToDisplay = '';
  if (sortDir) {
    arrowToDisplay = (sortDir === SortTypes.DESC) ? '↓' : '↑';
  }

  function onSortChangeFunc(e) {
    e.preventDefault();

    if (onSortChange) {
      onSortChange(
        columnKey,
        sortDir
          ? reverseSortDirection(sortDir)
          : SortTypes.DESC,
      );
    }
  }

  return (
    <th {...props} className="align-middle">
      <Button variant="link" onClick={onSortChangeFunc}>
        {cellName}
        {' '}
        {arrowToDisplay}
      </Button>
    </th>
  );
};

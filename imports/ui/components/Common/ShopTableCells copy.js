import React from 'react';
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
  <Cell {...props}>
    {moment(data.getObjectAt(rowIndex)[columnKey]).tz(dateSettings.timeZone).format(dateSettings.format)}
  </Cell>
);

export const RowSelectedCell = ({
  rowIndex, data, columnKey, onChecked, ...props
}) => {
  const isChecked = data.getObjectAt(rowIndex)[columnKey];
  return (
    <Cell {...props}>
      <Checkbox
        onClick={(e) => { onChecked(e, rowIndex); e.stopPropagation(); }}
        checked={isChecked}
      />
    </Cell>

  /* <Cell {...props} > <input type = "checkbox" onClick = { (e) => { onChecked(e, rowIndex); e.stopPropagation();} }
        /> </Cell> */
  );
};

export const OrderStatusCell = ({
  rowIndex, data, columnKey, ...props
}) => {
  const order_status = data.getObjectAt(rowIndex)[columnKey];
  const labelStyle = constants.OrderStatus[order_status].label;
  const statusToDisplay = constants.OrderStatus[order_status].display_value;
  return (
    <Cell {...props}>
      <Badge bg={labelStyle}>
        { statusToDisplay }
      </Badge>
    </Cell>
  );
};

export const ImageCell = ({
  rowIndex, data, columnKey, ...props
}) => (
  <LoadImage
    src={data.getObjectAt(rowIndex)[columnKey]}
  />
);

export const LinkCell = ({
  rowIndex, data, columnKey, callBack, ...props
}) => {
  if (callBack) {
    return (
      <Cell {...props}>
        <a onClick={(e) => { e.stopPropagation(); callBack(e, rowIndex); }}>{data.getObjectAt(rowIndex)[columnKey]}</a>
      </Cell>
    );
  }
  return TextCell({
    rowIndex, data, columnKey, ...props,
  });
};

export const TextCell = ({
  rowIndex, data, columnKey, ...props
}) => (
  <Cell {...props}>
    {data.getObjectAt(rowIndex)[columnKey]}
  </Cell>
);

export const AmountCell = ({
  rowIndex, data, columnKey, ...props
}) => (
  <Cell {...props}>
    {formatMoney(data.getObjectAt(rowIndex)[columnKey], accountSettings)}
  </Cell>
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
  sortDir, children, onSortChange, columnKey, ...props
}) => {
  return (
    <Cell {...props}>
      <a onClick={_onSortChange}>
        {children}
        {' '}
        {sortDir ? (sortDir === SortTypes.DESC ? '↓' : '↑') : ''}
      </a>
    </Cell>
  );

  function _onSortChange(e) {
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
};

import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, SplitButton, MenuItem, Button, ButtonToolbar,

  Alert, Panel,
} from 'react-bootstrap';
import Dimensions from 'react-dimensions';
import { Table, Column, Cell } from 'fixed-data-table-2';
import {
  DataListStore, SortTypes, SortHeaderCell, AmountCell, RowSelectedCell,
  TextCell, DateCell,
} from '../../Common/ShopTableCells';
import { getDayWithoutTime } from '../../../../modules/helpers';
import { dateSettings } from '../../../../modules/settings';
import constants from '../../../../modules/constants';

const UserListTable = ({
  dataList, dynamicWidth, onChecked, colSortDirs, onRowClickCallBack, onSortChangeCallBack, history, match,
}) => {
  function displayStatus(rowIndex, columnKey) {
    return dataList.getObjectAt(rowIndex)[columnKey];
  }
  return (
    <Table
      rowHeight={100}
      headerHeight={50}
      rowsCount={dataList.getSize()}
      width={dynamicWidth}
      onRowClick={onRowClickCallBack}
      height={5070}
    >
      <Column
        columnKey="username"
        cell={<TextCell data={dataList} />}
        flexGrow={1}
        width={25}
        header={(
          <SortHeaderCell
            onSortChange={onSortChangeCallBack}
            sortDir={colSortDirs.username}
          >
            User Name
          </SortHeaderCell>
        )}
      />
      <Column
        columnKey="createdAt"
        flexGrow={1}
        width={25}
        header={(
          <SortHeaderCell
            onSortChange={onSortChangeCallBack}
            sortDir={colSortDirs.createdAt}
          >
            DOJ
          </SortHeaderCell>
        )}
        cell={<TextCell data={dataList} />}
      />
      <Column
        columnKey="deliveryAddress"
        header={(
          <SortHeaderCell
            onSortChange={onSortChangeCallBack}
            sortDir={colSortDirs.deliveryAddress}
          >
            Delivery Address
          </SortHeaderCell>
        )}

        cell={<TextCell data={dataList} />}
        width={125}
        flexGrow={3}
      />
      <Column
        columnKey="firstName"
        header={(
          <SortHeaderCell
            onSortChange={onSortChangeCallBack}
            sortDir={colSortDirs.firstName}
            keyToPass="dsfasdfsd"
          >
            First Name
          </SortHeaderCell>
        )}

        cell={<TextCell data={dataList} />}
        width={50}
        flexGrow={1}
      />

      <Column
        columnKey="lastName"
        header={(
          <SortHeaderCell
            onSortChange={onSortChangeCallBack}
            sortDir={colSortDirs.lastName}
          >
            Last Name
          </SortHeaderCell>
        )}

        cell={<TextCell data={dataList} />}
        width={50}
        flexGrow={1}
      />

      <Column
        columnKey="accountStatus"
        header={(
          <SortHeaderCell
            onSortChange={onSortChangeCallBack}
            sortDir={colSortDirs.accountStatus}
          >
            Status
          </SortHeaderCell>
        )}

        cell={<TextCell data={dataList} />}
        width={25}
        flexGrow={1}
      />
      <Column
        columnKey="username"
        header={<Cell />}
        cell={({ rowIndex, columnKey }) => (
          <Cell>
            <Button
              bsStyle="primary"
              onClick={() => history.push(`updateProfile/${dataList.getObjectAt(rowIndex)[columnKey]}`)}
              block
            >
              View
            </Button>
          </Cell>

        )}
        width={25}
        flexGrow={1}
      />

    </Table>
  );
};

const UserList = ({
  users, history, match, colSortDirs, sortedDataList, containerWidth, containerHeight, onSortChange,
}) => (
  <Row>
    <UserListTable
      dataList={new DataListStore(users)}
      dynamicWidth={containerWidth}
      dynamicHeight={containerHeight}
      colSortDirs={colSortDirs}
      onSortChangeCallBack={onSortChange}
      history={history}
      match={match}
    />
  </Row>
);

const UserList1 = ({
  users, history, match, colSortDirs,
}) => (

  users.length ? (
    <Panel>
      {' '}
      <Table responsive>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Phone number</th>
            <th>Date Joined</th>
            <th>Date Last Order</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map(({
            _id, profile, createdAt, dlo,
          }) => (
            <tr key={_id}>
              <td>{profile.name.first}</td>
              <td>{profile.name.last}</td>
              <td>{profile.whMobilePhone}</td>
              <td>{getDayWithoutTime(createdAt, dateSettings.timeZone)}</td>
              <td>{dlo}</td>
              <td>
                <Button
                  bsStyle="primary"
                  onClick={() => history.push(`${match.url}/${profile.whMobilePhone}`)}
                  block
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {' '}
    </Panel>
  ) : <Alert bsStyle="info">No users were found!</Alert>
);

UserList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default Dimensions()(UserList);

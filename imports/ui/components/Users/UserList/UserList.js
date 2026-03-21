import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Table from 'react-bootstrap/Table';
import Icon from '../../Icon/Icon';
import { DataListStore, SortHeaderCell, TextCell } from '../../Common/ShopTableCells';
import { getDayWithoutTime } from '../../../../modules/helpers';
import { dateSettings } from '../../../../modules/settings';

const UserListTable = ({
  dataList, colSortDirs, onSortChangeCallBack, history,
}) => {
  const writeRows = () => {
    const rowList = [];
    for (let index = 0; index < dataList.getSize(); index += 1) {
      rowList.push(
        <tr>
          {<TextCell rowIndex={index} data={dataList} columnKey="username" />}
          {<TextCell rowIndex={index} data={dataList} columnKey="createdAt" />}
          {<TextCell rowIndex={index} data={dataList} columnKey="deliveryAddress" />}
          {<TextCell rowIndex={index} data={dataList} columnKey="firstName" />}
          {<TextCell rowIndex={index} data={dataList} columnKey="lastName" />}
          {<TextCell rowIndex={index} data={dataList} columnKey="accountStatus" />}
          {<td>
            <Button
              size="sm"
              variant="link"
              onClick={() => history.push(`updateProfile/${dataList.getObjectAt(index).username}`)}
              className="w-100 btn-block"
            >
              <Icon icon="more_vert" type="mt" />
            </Button>
           </td>}
        </tr>,
      );
    }
    return rowList;
  };

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <SortHeaderCell
            onSortChange={onSortChangeCallBack}
            sortDir={colSortDirs.username}
            cellName="User Name"
            columnKey="username"
          />

          <SortHeaderCell
            onSortChange={onSortChangeCallBack}
            sortDir={colSortDirs.createdAt}
            cellName="DOJ"
            columnKey="createdAt"
            style={{ minWidth: '7.5em' }}
          />

          <SortHeaderCell
            onSortChange={onSortChangeCallBack}
            sortDir={colSortDirs.deliveryAddress}
            cellName="Delivery Address"
            columnKey="deliveryAddress"
          />

          <SortHeaderCell
            onSortChange={onSortChangeCallBack}
            sortDir={colSortDirs.firstName}
            cellName="First Name"
            columnKey="firstName"
          />

          <SortHeaderCell
            onSortChange={onSortChangeCallBack}
            sortDir={colSortDirs.lastName}
            cellName="Last Name"
            columnKey="lastName"
          />

          <SortHeaderCell
            onSortChange={onSortChangeCallBack}
            sortDir={colSortDirs.accountStatus}
            cellName="Status"
            columnKey="accountStatus"
          />
          <th />
        </tr>
      </thead>
      <tbody>
        {writeRows()}
      </tbody>
    </Table>
  );
};

const UserList = ({
  users, history, match, colSortDirs, onSortChange,
}) => (
  <Row>
    <UserListTable
      dataList={new DataListStore(users)}
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
    <Row>
      {' '}
      <Table striped bordered responsive>
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
                  variant="secondary"
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
    </Row>
  ) : <Alert variant="info">No users were found!</Alert>
);

UserList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default UserList;

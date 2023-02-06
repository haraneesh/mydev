import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import Pagination from 'react-js-pagination';
import { toast } from 'react-toastify';
import { SortTypes } from '../../../../components/Common/ShopTableCells';
import constants from '../../../../../modules/constants';
import UserList from '../../../../components/Users/UserList/UserList';
import Loading from '../../../../components/Loading/Loading';
import { getDayWithoutTime } from '../../../../../modules/helpers';
import { dateSettings } from '../../../../../modules/settings';

import './Users.scss';

const Users = ({
  match, history,
}) => {
  const FIRSTPAGE = 1;
  const NUMBEROFROWS = 50;

  const [fetchState, setFetchState] = useState({
    sortBy: { createdAt: constants.Sort.DESCENDING },
    colSortDirs: { createdAt: SortTypes.DESC },
    currentPage: FIRSTPAGE,
    limit: NUMBEROFROWS,
  });

  const [users, setUsers] = useState({});
  const [totalUsers, setTotalUsers] = useState(-1);
  const [loading, setLoading] = useState(true);

  function createDataList() {
    const usrObjs = users.map((u) => ({
      createdAt: getDayWithoutTime(u.createdAt, dateSettings.timeZone),
      deliveryAddress: u.profile.deliveryAddress,
      firstName: u.profile.name.first,
      lastName: u.profile.name.last,
      username: u.username,
      accountStatus: u.status.accountStatus,
    }));

    return usrObjs;
  }

  function fetchPages(pageNumber, sortBy, colSortDirs) {
    const skip = (pageNumber * NUMBEROFROWS) - NUMBEROFROWS;

    setLoading(true);
    Meteor.call('users.getAllUsers', {
      sort: sortBy,
      limit: NUMBEROFROWS,
      skip,
    }, (error, pageOfUsers) => {
      if (error) {
        toast.error(error.reason);
      } else {
        setUsers(pageOfUsers);
        setFetchState({
          ...fetchState,
          colSortDirs,
          sortBy,
          currentPage: pageNumber,
        });

        setLoading(false);
      }
    });
  }

  function handlePageChange(pageNumber) {
    const { sortBy, colSortDirs } = fetchState;
    fetchPages(pageNumber, sortBy, colSortDirs);
  }

  useEffect(() => {
    Meteor.call('users.getTotalUserCount', (error, success) => {
      if (error) {
        toast.error(error.reason);
      } else {
        fetchPages(FIRSTPAGE, fetchState.sortBy, fetchState.colSortDirs);
        setTotalUsers(success);
      }
    });
  }, []);

  function changeSortOptions(columnKey, sortDir) {
    const sortDirection = (sortDir === SortTypes.DESC)
      ? constants.Sort.DESCENDING
      : constants.Sort.ASCENDING;

    let sortBy;

    switch (columnKey) {
      case 'createdAt':
        sortBy = { createdAt: sortDirection };
        break;
      case 'deliveryAddress':
        sortBy = { 'profile.deliveryAddress': sortDirection };
        break;
      case 'firstName':
        sortBy = { 'profile.name.first': sortDirection };
        break;
      case 'lastName':
        sortBy = { 'profile.name.last': sortDirection };
        break;
      case 'accountStatus':
        sortBy = { 'status.accountStatus': sortDirection };
        break;
      default:
        sortBy = { username: sortDirection };
        break;
    }

    const colSortDirs = {
      [columnKey]: sortDir,
    };

    fetchPages(fetchState.currentPage, sortBy, colSortDirs);
  }

  return (!loading ? (
    <div className="Users py-4">

      <h2 className="ps-2 pt-2">Users</h2>

      <UserList
        colSortDirs={fetchState.colSortDirs}
        users={createDataList()}
        match={match}
        history={history}
        onSortChange={changeSortOptions}
      />

      <Pagination
        itemClass="page-item"
        linkClass="page-link"
        activePage={fetchState.currentPage}
        itemsCountPerPage={NUMBEROFROWS}
        totalItemsCount={totalUsers}
        pageRangeDisplayed={10}
        onChange={handlePageChange}
      />

    </div>
  ) : <Loading />);
};

Users.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default Users;

/* withTracker(() => {
  const {
    currentPage, limit, sortBy,
  } = reactVar.get();

  const skip = (currentPage * limit) - limit;

  const subscription = Meteor.subscribe('users.getAllUsers', {
    sort: sortBy,
    limit,
    skip,
  });

  return {
    loading: !subscription.ready(),
    users: Meteor.users.find({}, {
      sort: sortBy,
      limit,
      skip,
    }).fetch(),
    currentPage,
  };
})(Users); */

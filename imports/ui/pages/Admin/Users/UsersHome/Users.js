import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Table, Alert, Button, Panel,
} from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { toast } from 'react-toastify';
import { ReactiveVar } from 'meteor/reactive-var';
import constants from '../../../../../modules/constants';
import { getDayWithoutTime } from '../../../../../modules/helpers';
import { dateSettings } from '../../../../../modules/settings';
import Loading from '../../../../components/Loading/Loading';

import './Users.scss';

const FIRSTPAGE = 1;
const NUMBEROFROWS = 100;
const reactVar = new ReactiveVar(
  {
    isWholeSale: false,
    sortBy: { createdAt: constants.Sort.DESCENDING },
    currentPage: FIRSTPAGE,
    limit: NUMBEROFROWS,
  },
);

const handleRemove = (supplierId) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('suppliers.remove', supplierId, (error) => {
      if (error) {
        toast.error(error.reason);a
      } else {
        toast.success('Supplier deleted!');
      }a
    });
  }
};

const Users = ({
  loading, users, match, history,
}) => (!loading ? (
  <div className="Users">
    <div className="page-header clearfix">
      <h3>Users</h3>
    </div>
    {users.length ? (
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
            {users.map(({ _id,profile, createdAt, dlo }) => (
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
    ) : <Alert bsStyle="info">No users were found!</Alert>}
  </div>
) : <Loading />);

Users.propTypes = {
  loading: PropTypes.bool.isRequired,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('users.getAllUsers');
  return {
    loading: !subscription.ready(),
    users: Meteor.users.find().fetch(),
  };
})(Users);

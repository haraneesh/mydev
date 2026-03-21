import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { withTracker } from 'meteor/react-meteor-data';
import { Mongo } from 'meteor/mongo';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';
import Badge from 'react-bootstrap/Badge';

import Loading from '../../components/Loading/Loading';
import Notifications from '../../../api/Notifications/Notifications';

const ITEMS_PER_PAGE = 10;

// Create a local collection for counts
const Counts = new Mongo.Collection('counts');

// Reactive variables for pagination
const subscribedPageVar = new ReactiveVar(1);
const nonSubscribedPageVar = new ReactiveVar(1);

const NotificationSubscribers = ({ 
  loading, 
  subscribedUsers, 
  nonSubscribedUsers,
  subscribedCount,
  nonSubscribedCount,
}) => {
  const [activeTab, setActiveTab] = useState('subscribed');
  const [subscribedPage, setSubscribedPage] = useState(1);
  const [nonSubscribedPage, setNonSubscribedPage] = useState(1);

  const getDeviceCount = (userId) => {
    // Count unique devices by deviceUuid (if available), otherwise fall back to playerId
    const notifications = Notifications.find({ userId }).fetch();
    
    // Get unique device UUIDs (for new records with deviceUuid)
    const deviceUuids = notifications
      .filter(n => n.deviceUuid)
      .map(n => n.deviceUuid);
    const uniqueDeviceUuids = new Set(deviceUuids);
    
    // Get player IDs for old records without deviceUuid (backward compatibility)
    const playerIdsWithoutUuid = notifications
      .filter(n => !n.deviceUuid)
      .map(n => n.playerId);
    const uniquePlayerIds = new Set(playerIdsWithoutUuid);
    
    // Total unique devices = unique deviceUuids + unique playerIds (for old records)
    return uniqueDeviceUuids.size + uniquePlayerIds.size;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getUserName = (user) => {
    if (!user) return 'Unknown';
    
    // Handle profile.name as an object with first/last properties
    if (user.profile?.name) {
      if (typeof user.profile.name === 'string') {
        return user.profile.name;
      } else if (typeof user.profile.name === 'object') {
        const { first, last } = user.profile.name;
        return [first, last].filter(Boolean).join(' ') || 'Unknown';
      }
    }
    
    return user.username || user.emails?.[0]?.address || 'Unknown';
  };

  const getUserEmail = (user) => {
    if (!user || !user.emails || user.emails.length === 0) return 'No email';
    // Meteor stores emails as an array of objects: [{address: "...", verified: true}]
    return user.emails[0].address || 'No email';
  };

  const renderPagination = (currentPage, totalCount, onPageChange, pageVar) => {
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    const items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => {
            onPageChange(number);
            pageVar.set(number);
          }}
        >
          {number}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="justify-content-center mt-4">
        <Pagination.First 
          onClick={() => { onPageChange(1); pageVar.set(1); }} 
          disabled={currentPage === 1} 
        />
        <Pagination.Prev 
          onClick={() => { 
            const newPage = currentPage - 1; 
            onPageChange(newPage); 
            pageVar.set(newPage); 
          }} 
          disabled={currentPage === 1} 
        />
        {items}
        <Pagination.Next 
          onClick={() => { 
            const newPage = currentPage + 1; 
            onPageChange(newPage); 
            pageVar.set(newPage); 
          }} 
          disabled={currentPage === totalPages} 
        />
        <Pagination.Last 
          onClick={() => { 
            onPageChange(totalPages); 
            pageVar.set(totalPages); 
          }} 
          disabled={currentPage === totalPages} 
        />
      </Pagination>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Row>
      <Col xs={12}>
        <h2 className="py-4">Notification Subscribers</h2>

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          {/* Subscribed Users Tab */}
          <Tab 
            eventKey="subscribed" 
            title={
              <>
                Subscribed Users <Badge bg="success">{subscribedCount}</Badge>
              </>
            }
          >
            <div className="mb-5">
              {subscribedUsers.length === 0 ? (
                <p className="text-muted">No users have subscribed to notifications yet.</p>
              ) : (
                <>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Devices</th>
                        <th>Player ID</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribedUsers.map((user) => {
                        // Get player IDs for this user
                        const userNotifications = Notifications.find({ userId: user._id }).fetch();
                        const playerIds = userNotifications.map(n => n.playerId).filter(Boolean);
                        
                        return (
                          <tr key={user._id}>
                            <td>{getUserName(user)}</td>
                            <td>{getUserEmail(user)}</td>
                            <td>
                              <Badge bg="primary">{getDeviceCount(user._id)}</Badge>
                            </td>
                            <td>
                              {playerIds.length > 0 ? (
                                <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {playerIds.join(', ')}
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>{formatDate(user.createdAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>

                  {renderPagination(
                    subscribedPage,
                    subscribedCount,
                    setSubscribedPage,
                    subscribedPageVar
                  )}
                </>
              )}
            </div>
          </Tab>

          {/* Non-Subscribed Users Tab */}
          <Tab 
            eventKey="notSubscribed" 
            title={
              <>
                Not Subscribed <Badge bg="secondary">{nonSubscribedCount}</Badge>
              </>
            }
          >
            <div className="mb-5">
              {nonSubscribedUsers.length === 0 ? (
                <p className="text-muted">All users have subscribed to notifications!</p>
              ) : (
                <>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nonSubscribedUsers.map((user) => (
                        <tr key={user._id}>
                          <td>{getUserName(user)}</td>
                          <td>{getUserEmail(user)}</td>
                          <td>{formatDate(user.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {renderPagination(
                    nonSubscribedPage,
                    nonSubscribedCount,
                    setNonSubscribedPage,
                    nonSubscribedPageVar
                  )}
                </>
              )}
            </div>
          </Tab>
        </Tabs>
      </Col>
    </Row>
  );
};

NotificationSubscribers.propTypes = {
  loading: PropTypes.bool.isRequired,
  subscribedUsers: PropTypes.arrayOf(PropTypes.object).isRequired,
  nonSubscribedUsers: PropTypes.arrayOf(PropTypes.object).isRequired,
  subscribedCount: PropTypes.number.isRequired,
  nonSubscribedCount: PropTypes.number.isRequired,
};

export default withTracker(() => {
  // Get current pages from reactive vars
  const subscribedPage = subscribedPageVar.get();
  const nonSubscribedPage = nonSubscribedPageVar.get();
  
  const subscribedSkip = (subscribedPage - 1) * ITEMS_PER_PAGE;
  const nonSubscribedSkip = (nonSubscribedPage - 1) * ITEMS_PER_PAGE;

  // Subscribe to data
  const subscribedListSub = Meteor.subscribe('notificationSubscribers.list', ITEMS_PER_PAGE, subscribedSkip);
  const subscribedCountSub = Meteor.subscribe('notificationSubscribers.count');
  const nonSubscribedListSub = Meteor.subscribe('notificationNonSubscribers.list', ITEMS_PER_PAGE, nonSubscribedSkip);
  const nonSubscribedCountSub = Meteor.subscribe('notificationNonSubscribers.count');
  const notificationsSub = Meteor.subscribe('notifications.allPlayerIds');

  const loading = !subscribedListSub.ready() || 
                  !subscribedCountSub.ready() || 
                  !nonSubscribedListSub.ready() || 
                  !nonSubscribedCountSub.ready() ||
                  !notificationsSub.ready();

  // Get users directly from what the publications sent
  // The publications handle the filtering, we just fetch what's available
  const subscribedUserIds = Notifications.find({}).fetch().map(n => n.userId);
  const uniqueSubscribedIds = Array.from(new Set(subscribedUserIds)).filter(id => id);
  
  // Fetch subscribed users (these come from the notificationSubscribers.list publication)
  const subscribedUsers = Meteor.users.find(
    { _id: { $in: uniqueSubscribedIds } }
  ).fetch().filter(user => user); // Filter out any null/undefined users

  // Fetch non-subscribed users (these come from the notificationNonSubscribers.list publication)
  const nonSubscribedUsers = Meteor.users.find(
    { _id: { $nin: uniqueSubscribedIds } }
  ).fetch().filter(user => user); // Filter out any null/undefined users

  // Get counts
  const subscribedCountDoc = Counts.findOne('notificationSubscribers');
  const nonSubscribedCountDoc = Counts.findOne('notificationNonSubscribers');

  return {
    loading,
    subscribedUsers: subscribedUsers || [],
    nonSubscribedUsers: nonSubscribedUsers || [],
    subscribedCount: subscribedCountDoc?.count || 0,
    nonSubscribedCount: nonSubscribedCountDoc?.count || 0,
  };
})(NotificationSubscribers);

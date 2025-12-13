import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { withTracker } from 'meteor/react-meteor-data';
import { useNavigate } from 'react-router-dom';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';
import Spinner from 'react-bootstrap/Spinner';
import Badge from 'react-bootstrap/Badge';

import AdminMessages from '../../../api/AdminMessages/AdminMessages';
import Loading from '../../components/Loading/Loading';
import Icon from '../../components/Icon/Icon';

const ITEMS_PER_PAGE = 10;

// Reactive variable for current page
const currentPageVar = new ReactiveVar(1);

const SendMessageToUsers = ({ loading, messages, totalCount }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});
  const [refreshingStatus, setRefreshingStatus] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSendTest = async () => {
    if (!title.trim() || !message.trim()) {
      setError('Please enter both title and message');
      return;
    }

    setError('');
    setSending(true);

    try {
      const result = await Meteor.callAsync('sendTestMessageToAdmin', { title, message });
      
      if (result.sent) {
        setTestResult({
          success: true,
          title: 'Test Notification Sent',
          message: result.message || 'A test notification has been sent to your device.',
          subMessage: 'Please check your device to verify the message appears correctly.'
        });
        setShowTestModal(true);
      } else if (result.reason === 'no-devices') {
        setTestResult({
          success: false,
          title: 'Admin App Not Installed',
          message: result.message || 'You have no registered devices.',
          subMessage: ''
        });
        setShowTestModal(true);
      } else {
        setError(result.reason || 'Failed to send test message');
      }
    } catch (err) {
      setError(err.reason || 'Failed to send test message');
    } finally {
      setSending(false);
    }
  };

  const handleConfirmSend = () => {
    setShowTestModal(false);
    setShowConfirmModal(true);
  };

  const handleSendToAll = async () => {
    setShowConfirmModal(false);
    setSending(true);
    setError('');

    try {
      await Meteor.callAsync('confirmAndSendToAll', { title, message });
      setSuccess('Message sent successfully to all users!');
      setTitle('');
      setMessage('');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.reason || 'Failed to send message to all users');
    } finally {
      setSending(false);
    }
  };

  const handleRefreshStatus = async (messageId) => {
    setRefreshingStatus({ ...refreshingStatus, [messageId]: true });
    setError('');

    try {
      const result = await Meteor.callAsync('refreshMessageDeliveryStatus', messageId);
      
      if (result && result.error === 'no-notification-id') {
        setErrorMessage(result.reason || 'No OneSignal notification ID found for this message');
        setShowErrorModal(true);
      }
    } catch (err) {
      setError(err.reason || 'Failed to refresh delivery status');
    } finally {
      setRefreshingStatus({ ...refreshingStatus, [messageId]: false });
    }
  };

  const toggleExpandRow = (messageId) => {
    setExpandedRows({
      ...expandedRows,
      [messageId]: !expandedRows[messageId],
    });
  };

  const handleDeleteClick = (messageId) => {
    setMessageToDelete(messageId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    
    setShowDeleteModal(false);
    setError('');

    try {
      await Meteor.callAsync('deleteMessage', messageToDelete);
      setSuccess('Message deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.reason || 'Failed to delete message');
    } finally {
      setMessageToDelete(null);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => {
            setCurrentPage(number);
            currentPageVar.set(number);
          }}
        >
          {number}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="justify-content-center mt-4">
        <Pagination.First onClick={() => { setCurrentPage(1); currentPageVar.set(1); }} disabled={currentPage === 1} />
        <Pagination.Prev onClick={() => { const newPage = currentPage - 1; setCurrentPage(newPage); currentPageVar.set(newPage); }} disabled={currentPage === 1} />
        {items}
        <Pagination.Next onClick={() => { const newPage = currentPage + 1; setCurrentPage(newPage); currentPageVar.set(newPage); }} disabled={currentPage === totalPages} />
        <Pagination.Last onClick={() => { setCurrentPage(totalPages); currentPageVar.set(totalPages); }} disabled={currentPage === totalPages} />
      </Pagination>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Row>
      <Col xs={12}>

        {/* Error/Success Messages */}
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Message Composition Form */}
        <div className="mb-5 p-4 border rounded">

         <h2 className="py-4">Send Message To Users</h2>
        {/* Info Banner */}
        <Alert variant="info" className="mb-4">
          Messages will be sent as push notifications to all users who have the mobile app installed and notifications enabled.
        </Alert>
          
          <h4 className="mb-3">Compose Message</h4>
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={sending}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Enter notification message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending}
              />
            </Form.Group>

            <Button
              variant="primary"
              onClick={handleSendTest}
              disabled={sending || !title.trim() || !message.trim()}
            >
              {sending ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Sending...
                </>
              ) : (
                'Send Test to Me'
              )}
            </Button>
          </Form>
        </div>

        {/* Message History */}
        <div className="mb-5 p-4">
          <h3 className="mb-3">Message History</h3>
          
          {messages.length === 0 ? (
            <Alert variant="primary">No messages sent yet.</Alert>
          ) : (
            <>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Date Sent</th>
                    <th>Title</th>
                    <th>Message</th>
                    <th>Delivery Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <React.Fragment key={msg._id}>
                      <tr>
                        <td>{formatDate(msg.sentAt)}</td>
                        <td>{msg.title}</td>
                        <td className="text-truncate" style={{ maxWidth: '300px' }}>
                          {msg.message}
                        </td>
                        <td>
                          {msg.deliveryStatus ? (
                            <div>
                              <Badge bg="success" className="me-1">
                                ✓ {msg.deliveryStatus.successful || 0}
                              </Badge>
                              <Badge bg="secondary" className="me-1">
                                ✗ {msg.deliveryStatus.failed || 0}
                              </Badge>
                              <Badge bg="info">
                                Total: {msg.deliveryStatus.totalRecipients || 0}
                              </Badge>
                              <div className="small text-muted mt-1">
                                Updated: {formatDate(msg.deliveryStatus.lastUpdated)}
                              </div>
                            </div>
                          ) : (
                            <Badge bg="secondary">No data</Badge>
                          )}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleRefreshStatus(msg._id)}
                            disabled={refreshingStatus[msg._id]}
                            className="me-2"
                          >
                            {refreshingStatus[msg._id] ? (
                              <Spinner as="span" animation="border" size="sm" />
                            ) : (
                              'Refresh'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="info"
                            onClick={() => toggleExpandRow(msg._id)}
                          >
                            {expandedRows[msg._id] ? '▲ Hide' : '▼ View'}
                          </Button>
                          <Button
                            size="sm"
                            variant="link"
                            onClick={() => handleDeleteClick(msg._id)}
                            title="Delete Message"
                          >
                            <Icon icon="delete" type="mt" />
                          </Button>

                        </td>
                      </tr>
                      {expandedRows[msg._id] && (
                        <tr>
                          <td colSpan="5" className="bg-light">
                            <div className="p-3">
                              <h6>Message Details</h6>
                              <p><strong>Full Message:</strong> {msg.message}</p>
                              <p><strong>OneSignal ID:</strong> {msg.oneSignalNotificationId || 'N/A'}</p>
                              <p><strong>Broadcast Sent:</strong> {formatDate(msg.broadcastSentAt)}</p>
                              
                              {msg.deliveryStatus && (
                                <>
                                  <h6 className="mt-3">Delivery Statistics</h6>
                                  <ul>
                                    <li>Total Recipients: {msg.deliveryStatus.totalRecipients || 0}</li>
                                    <li>Successful: {msg.deliveryStatus.successful || 0}</li>
                                    <li>Failed: {msg.deliveryStatus.failed || 0}</li>
                                    <li>Converted (Opened): {msg.deliveryStatus.converted || 0}</li>
                                    <li>Remaining: {msg.deliveryStatus.remaining || 0}</li>
                                  </ul>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </Table>

              {renderPagination()}
            </>
          )}
        </div>

        {/* Test Confirmation Modal */}
        {/* Test Confirmation Modal */}
        <Modal show={showTestModal} onHide={() => setShowTestModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{testResult?.title || 'Test Notification'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {testResult?.success ? (
              <Alert variant="info">
                <i className="bi bi-check-circle-fill me-2"></i>
                Test sent successfully!
              </Alert>
            ) : (
              <Alert variant="warning">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Admin device not found
              </Alert>
            )}
            <p>{testResult?.message}</p>
            <p>{testResult?.subMessage}</p>
            <p className="mb-0 mt-3"><strong>Do you want to send this message to all users?</strong></p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowTestModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmSend}>
              Yes, Send to All Users
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Final Confirmation Modal */}
        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Final Confirmation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="info">
              This will send the notification to ALL users with the mobile app installed.
            </Alert>
            <p><strong>Title:</strong> {title}</p>
            <p><strong>Message:</strong> {message}</p>
            <p className="mb-0">Are you absolutely sure you want to proceed?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSendToAll}>
              Confirm & Send to All
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="info">
              Are you sure you want to delete this message record? <br/> This action cannot be undone.
            </Alert>
            <p>
              This only deletes the record from your database. If the notification was already sent via OneSignal, it cannot be recalled.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleConfirmDelete}>
              Delete Record
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Error Modal */}
        <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="info">
              {errorMessage}
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setShowErrorModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  );
};

SendMessageToUsers.propTypes = {
  loading: PropTypes.bool.isRequired,
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalCount: PropTypes.number.isRequired,
};

export default withTracker(() => {
  // Get current page from reactive var
  const currentPage = currentPageVar.get();
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const subscription = Meteor.subscribe('adminMessages.list', ITEMS_PER_PAGE, skip);
  const countSubscription = Meteor.subscribe('adminMessages.count');

  const loading = !subscription.ready() || !countSubscription.ready();

  const messages = AdminMessages.find({}, {
    sort: { sentAt: -1 },
    limit: ITEMS_PER_PAGE,
    skip,
  }).fetch();

  // Get total count
  const totalCount = AdminMessages.find({}).count();

  return {
    loading,
    messages,
    totalCount,
  };
})(SendMessageToUsers);


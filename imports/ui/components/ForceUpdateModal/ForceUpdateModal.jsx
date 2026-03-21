import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ForceUpdateModal = ({ show, storeUrl, minVersion, codeUpdateRequired, updateError, onUpdateNow }) => {
  const handleUpdate = () => {
    if (typeof onUpdateNow === 'function') {
      onUpdateNow();
    }
  };

  const renderContent = () => {
    if (codeUpdateRequired) {
      return (
        <Modal.Body className="text-center p-4">
          <div className="mb-4">
            <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
          <h4>Updating App...</h4>
          <p className="text-muted mb-0">
            Downloading the latest version.<br/>The app will reload automatically.
          </p>
        </Modal.Body>
      );
    }

    return (
      <>
        <Modal.Body className="text-center p-4">
          <div className="mb-4">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '64px' }}>
              system_update
            </span>
          </div>
          <h4>Update Required</h4>
          <p className="text-muted mb-4">
            A new version of the app is required to continue using Namma Suvai. 
            Please update from the app store.
          </p>
          {minVersion && (
            <p className="small text-muted">
              Required version: {minVersion}
            </p>
          )}
          {updateError && (
            <Alert variant="warning" className="mt-3 mb-0">
              {updateError}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleUpdate}
            disabled={!storeUrl && !updateError}
          >
            Update Now
          </Button>
        </Modal.Footer>
      </>
    );
  };

  return (
    <Modal
      show={show}
      backdrop="static"
      keyboard={false}
      centered
      className="force-update-modal"
      style={{ zIndex: 9999 }} // Ensure it's on top of everything
    >
      <Modal.Header className="justify-content-center border-0">
        <Modal.Title>
          <h4 className="mb-0">
            {codeUpdateRequired ? 'Updating App' : 'Update Required'}
          </h4>
        </Modal.Title>
      </Modal.Header>
      {renderContent()}
    </Modal>
  );
};

ForceUpdateModal.propTypes = {
  show: PropTypes.bool.isRequired,
  storeUrl: PropTypes.string,
  minVersion: PropTypes.string,
  codeUpdateRequired: PropTypes.bool,
  updateError: PropTypes.string,
  onUpdateNow: PropTypes.func,
};

export default ForceUpdateModal;

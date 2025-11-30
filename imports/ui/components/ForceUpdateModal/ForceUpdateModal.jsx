import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ForceUpdateModal = ({ show, storeUrl, minVersion }) => {
  const handleUpdate = () => {
    if (storeUrl) {
      if (window.cordova && window.cordova.InAppBrowser) {
        window.cordova.InAppBrowser.open(storeUrl, '_system');
      } else {
        window.open(storeUrl, '_system');
      }
    }
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
      <Modal.Header className="justify-content-center">
        <Modal.Title><h4> Update Required </h4></Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center p-4">
        <div className="mb-4">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '64px' }}>
            system_update
          </span>
        </div>
        <h4>New Version Available</h4>
        <p className="text-muted mb-4">
          A new version of the app is available. Please update to continue using Namma Suvai.
        </p>
        {minVersion && (
          <p className="small text-muted">
            Required version: {minVersion}
          </p>
        )}
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleUpdate}
        >
          Update Now
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ForceUpdateModal.propTypes = {
  show: PropTypes.bool.isRequired,
  storeUrl: PropTypes.string,
  minVersion: PropTypes.string,
};

export default ForceUpdateModal;

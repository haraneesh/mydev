import React from 'react';
import DocumentEditor from '../components/DocumentEditor.js';

const EditDocument = ({ doc }) => (
  <div className="EditDocument">
    <h3 className="page-header">Editing "{ doc.title }"</h3>
    <DocumentEditor doc={ doc } />
  </div>
);

EditDocument.propTypes = {
  doc: React.PropTypes.object,
};

export default EditDocument;

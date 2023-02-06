import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Documents from '../../../../api/Documents/Documents';
import DocumentEditor from '../../../components/DocumentEditor/DocumentEditor';
import NotFound from '../../Miscellaneous/NotFound/NotFound';

const EditDocument = ({ doc, history }) => (doc ? (
  <div className="EditDocument">
    <h4 className="py-4">{`Editing "${doc.title}"`}</h4>
    <DocumentEditor doc={doc} history={history} />
  </div>
) : <NotFound />);

EditDocument.propTypes = {
  doc: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker(({ match }) => {
  const documentId = match.params._id;
  const subscription = Meteor.subscribe('documents.view', documentId);

  return {
    loading: !subscription.ready(),
    doc: Documents.findOne(documentId),
  };
})(EditDocument);

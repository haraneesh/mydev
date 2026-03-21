import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';
import Documents from '../../../../api/Documents/Documents';
import NotFound from '../../Miscellaneous/NotFound/NotFound';
import Loading from '../../../components/Loading/Loading';

const handleRemove = (documentId, history) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('documents.remove', documentId, (error) => {
      if (error) {
        toast.error(error.reason);
      } else {
        toast.success('Document deleted!');
        history.push('/documents');
      }
    });
  }
};

const renderDocument = (doc, match, history) => (doc ? (
  <div className="ViewDocument">
    <div className="py-4 clearfix">
      <h4 className="pull-left">{ doc && doc.title }</h4>
      <Row className="pull-right pe-2">
        <Button size="sm" onClick={() => history.push(`${match.url}/edit`)}>Edit</Button>
        <Button size="sm" onClick={() => handleRemove(doc._id, history)} className="text-danger">
          Delete
        </Button>
      </Row>
    </div>
    { doc && doc.body }
  </div>
) : <NotFound />);

const ViewDocument = ({
  loading, doc, match, history,
}) => (
  !loading ? renderDocument(doc, match, history) : <Loading />
);

ViewDocument.propTypes = {
  loading: PropTypes.bool.isRequired,
  doc: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker(({ match }) => {
  const documentId = match.params._id;
  const subscription = Meteor.subscribe('documents.view', documentId);

  return {
    loading: !subscription.ready(),
    doc: Documents.findOne(documentId) || {},
  };
})(ViewDocument);

import React, {
  useState, useRef, useLayoutEffect,
} from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { ReactiveVar } from 'meteor/reactive-var';
import { Alert, Row, Button } from 'react-bootstrap';
import MessagesCollection from '../../../../api/Messages/Messages';
import Loading from '../../../components/Loading/Loading';
import MessageEditor from '../../../components/Messages/MessageEditor';
import MessageView from '../../../components/Messages/MessageView';

import constants from '../../../../modules/constants';

const PAGE_LENGTH_SIZE = 10;
const reactVar = new ReactiveVar(
  {
    pageNumber: 1,
  },
);

const Messages = ({ loading, messages, history }) => {
  const [editMessage, setEditMessage] = useState('');

  const scrollToYAfterLoad = useRef(0);
  const pageNumberBeforeRefresh = useRef(reactVar.get().pageNumber);

  const handleEditMessage = (id) => {
    setEditMessage(id);
  };

  const handleMessageUpdate = () => {
    setEditMessage('');
  };

  const bringNextBatch = () => {
    const rVar = reactVar.get();
    reactVar.set({
      pageNumber: rVar.pageNumber + 1,
    });
  };

  useLayoutEffect(() => {
    if (loading) {
      scrollToYAfterLoad.current = window.scrollY;
    } else {
      if (pageNumberBeforeRefresh.current !== reactVar.get().pageNumber) {
        window.scrollTo(0, scrollToYAfterLoad.current);
      }
      pageNumberBeforeRefresh.current = reactVar.get().pageNumber;
    }
  });

  return !loading ? (
    <div className="Messages">
      <div className="page-header clearfix">
        <h3>Messages</h3>
        {/* <Link className="btn btn-success pull-right"
        to={`${match.url}/new`}>Add Message</Link> */}
      </div>

      <MessageEditor history={history} />
      {messages.length
        ? (
          <>
            {' '}
            {messages.map((msg) => (
              <p key={msg._id}>
                {
            (editMessage === msg._id)
              ? (
                <MessageEditor
                  history={history}
                  existingMessage={msg}
                  showOpen
                  onsuccessFullUpdate={handleMessageUpdate}
                />
              )
              : (
                <MessageView
                  existingMessage={msg}
                  history={history}
                  handleEditMessage={handleEditMessage}
                />
              )
          }
              </p>
            ))}

            <Row className="text-center">
              <Button className="btn btn-default" onClick={bringNextBatch}>Load More </Button>
            </Row>
          </>
        )
        : <Alert bsStyle="warning">No messages yet!</Alert>}
    </div>
  )
    : (<Loading />);
};

Messages.propTypes = {
  loading: PropTypes.bool.isRequired,
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker((args) => {
  const rVar = reactVar.get();
  const subscription = Meteor.subscribe('messages', {
    limit: rVar.pageNumber * PAGE_LENGTH_SIZE,
  });

  return {
    history: args.history,
    loading: !subscription.ready(),
    messages: MessagesCollection.find({},
      { sort: { updatedAt: constants.Sort.DESCENDING } }).fetch(),
  };
})(Messages);

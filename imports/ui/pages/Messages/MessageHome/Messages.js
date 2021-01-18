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

const Messages = ({
  loading, messages, history, loggedInUserId,
}) => {
  const [editMessage, setEditMessage] = useState('');
  const [filterSelected, setFilterSelected] = useState('none');

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

  const onFilterSelect = (filterState) => {
    setFilterSelected(filterState);
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

  const doesMsgMatchFilter = (msg) => {
    if (filterSelected === 'my' && (msg.to !== constants.Roles.customer.name)) {
      return true;
    }
    return false;
  };

  return !loading ? (
    <div className="Messages">
      <div className="page-header clearfix">
        <h3>Messages</h3>
      </div>

      <MessageEditor history={history} showOpen doNotShowClose />

      <ul className="nav nav-pills">
        <li role="presentation" className={(filterSelected === 'none') ? 'active' : ''}>
          <button
            type="button"
            onClick={() => { onFilterSelect('none'); }}
          >
            All
          </button>
        </li>
        <li className={(filterSelected === 'my') ? 'active' : ''}>
          <button
            type="button"
            onClick={() => { onFilterSelect('my'); }}
          >
            My
          </button>
        </li>
      </ul>

      {messages.length
        ? (
          <>
            {messages.map((msg) => {
              if (filterSelected === 'none' || doesMsgMatchFilter(msg)) {
                return (
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
                        loggedInUserId={loggedInUserId}
                      />
                    )
                }
                  </p>
                );
              }
            })}

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
  loggedInUserId: PropTypes.string.isRequired,
};

export default withTracker((args) => {
  const rVar = reactVar.get();
  const subscription = Meteor.subscribe('messages.customer', {
    limit: rVar.pageNumber * PAGE_LENGTH_SIZE,
  });

  return {
    history: args.history,
    loggedInUserId: args.loggedInUserId,
    loading: !subscription.ready(),
    messages: MessagesCollection.find({},
      { sort: { createdAt: constants.Sort.DESCENDING } }).fetch(),
  };
})(Messages);

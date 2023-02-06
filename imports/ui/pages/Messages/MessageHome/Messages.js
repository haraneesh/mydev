import React, {
  useState, useRef, useLayoutEffect,
} from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { ReactiveVar } from 'meteor/reactive-var';
import Row from 'react-bootstrap/Row';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
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
    <div className="Messages pb-4">
      <Row className="py-4 text-center">
        <h3>Messages</h3>
      </Row>

      <MessageEditor history={history} showOpen doNotShowClose />

      <ul className="nav nav-tabs px-2">
        <li role="presentation" className="nav-item">
          <button
            type="button"
            onClick={() => { onFilterSelect('none'); }}
            className={(filterSelected === 'none') ? 'nav-link active' : 'nav-link'}
          >
            All
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            onClick={() => { onFilterSelect('my'); }}
            className={(filterSelected === 'my') ? 'nav-link active' : 'nav-link'}
          >
            My
          </button>
        </li>
      </ul>

      {(messages.length && messages.length > 0)
        ? (
          <>
            {messages.map((msg) => {
              if (filterSelected === 'none' || doesMsgMatchFilter(msg) || Meteor.userId() === msg.owner) {
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

            <div className="text-center col-12 my-2">
              <Button className="px-5" onClick={bringNextBatch}>
                Load More
              </Button>
            </div>
          </>
        )
        : <Alert variant="warning">No messages yet!</Alert>}
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

import React, {
  useState, useRef, useLayoutEffect,
} from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { ReactiveVar } from 'meteor/reactive-var';
import { Row, Alert, Button } from 'react-bootstrap';
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

const MessagesAdmin = ({ loading, messages, history }) => {
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

  const onFilterSelect = (e) => {
    setFilterSelected(e.target.value);
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

  const doesMsgMatchFilter = (msg) => {
    if (filterSelected === 'my' && (msg.ownerRole === 'admin' || msg.to === 'admin')) {
      return true;
    }
    return false;
  };

  return (
    <div className="Messages">
      {loading && (<Loading />)}
      <div className="page-header clearfix">
        <h3>Admin Messages</h3>
        {/* <Link className="btn btn-success pull-right" to={`${match.url}/new`}>Add Message</Link> */}
      </div>

      <MessageEditor history={history} isAdmin showOpen doNotShowClose />

      <div className="panel-heading" style={{ padding: '0.5rem 0.5rem' }}>
        <select className="form-control" name="filter" id="idFilter" onChange={onFilterSelect}>
          <option value="none">All</option>
          <option value="my">My messages</option>

        </select>
      </div>

      {messages.length
        ? (
          <>
            {messages.map((msg) => {
              if (filterSelected === 'none' || doesMsgMatchFilter(msg)) {
                return (
                  <div style={{ marginBottom: '1rem' }} key={msg._id}>
                    {
                      (editMessage === msg._id)
                        ? (
                          <MessageEditor
                            history={history}
                            existingMessage={msg}
                            showOpen
                            onsuccessFullUpdate={handleMessageUpdate}
                            isAdmin
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
                  </div>
                );
              }
            })}
            <Row className="text-center">
              <Button className="btn btn-default" onClick={bringNextBatch}>Load More </Button>
            </Row>
          </>
        ) : !loading && (<Alert bsStyle="warning">No messages yet!</Alert>)}
    </div>
  );
};

MessagesAdmin.propTypes = {
  loading: PropTypes.bool.isRequired,
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker((args) => {
  const rVar = reactVar.get();
  const subscription = Meteor.subscribe('messages.all', {
    // limit: PAGE_LENGTH_SIZE ,
    limit: rVar.pageNumber * PAGE_LENGTH_SIZE,
    // skip: (rVar.pageNumber - 1) * PAGE_LENGTH_SIZE,

  });
  return {
    history: args.history,
    loading: !subscription.ready(),
    messages: MessagesCollection.find({}, {
      sort: { updatedAt: constants.Sort.DESCENDING },
    }).fetch(),
  };
})(MessagesAdmin);

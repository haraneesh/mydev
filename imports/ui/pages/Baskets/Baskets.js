import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table, Alert, Button, Panel } from 'react-bootstrap';
//import { timeago, monthDayYearAtTime } from '@cleverbeagle/dates';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Bert } from 'meteor/themeteorchef:bert';
import BasketsCollection from '../../../api/Baskets/Baskets';
import Loading from '../../components/Loading/Loading';

const handleRemove = (basketId) => {
    if (confirm('Are you sure? This is permanent!')) {
        Meteor.call('baskets.remove', basketId, (error) => {
            if (error) {
                Bert.alert(error.reason, 'danger');
            } else {
                Bert.alert('Basket deleted!', 'success');
            }
        });
    }
};

const Baskets = ({ loading, baskets, match, history }) => (!loading ? (
    <div className="Baskets">
        <div className="page-header clearfix">
            <h3 className="pull-left">Baskets</h3>
            <Link className="btn btn-primary pull-right" to={`${match.url}/new`}>Add Basket</Link>
        </div>
        {baskets.length ? <Panel> <Table responsive>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th />
                </tr>
            </thead>
            <tbody>
                {baskets.map(({ _id, name, description }) => (
                    <tr key={_id}>
                        <td>{name}</td>
                        <td>{description}</td>
                        <td>
                            <Button
                                bsStyle="primary"
                                onClick={() => history.push(`${match.url}/${_id}`)}
                                block
                            >View</Button>
                        </td>
                        <td>
                            <Button
                                bsStyle="info"
                                onClick={() => handleRemove(_id)}
                                block
                            >Delete</Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table> </Panel> : <Alert bsStyle="info">No baskets yet!</Alert>}
    </div>
) : <Loading />);

Baskets.propTypes = {
    loading: PropTypes.bool.isRequired,
    baskets: PropTypes.arrayOf(PropTypes.object).isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default withTracker(() => {
    const subscription = Meteor.subscribe('baskets');
    return {
        loading: !subscription.ready(),
        baskets: BasketsCollection.find().fetch(),
    };
})(Baskets);

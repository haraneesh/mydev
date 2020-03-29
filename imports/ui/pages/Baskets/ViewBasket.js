import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { ButtonToolbar, ButtonGroup, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import Baskets from '../../../api/Baskets/Baskets';
import NotFound from '../Miscellaneous/NotFound/NotFound';
import Loading from '../../components/Loading/Loading';

const handleRemove = (basketId, history) => {
    if (confirm('Are you sure? This is permanent!')) {
        Meteor.call('baskets.remove', basketId, (error) => {
            if (error) {
                Bert.alert(error.reason, 'danger');
            } else {
                Bert.alert('Basket deleted!', 'success');
                history.push('/baskets');
            }
        });
    }
};

const renderBasket = (supp, match, history) => (supp ? (
    <div className="ViewBasket">
        <div className="page-header clearfix">
            <h3 className="pull-left">{supp && supp.name}</h3>
            <ButtonToolbar className="pull-right">
                <ButtonGroup bsSize="small">
                    <Button onClick={() => history.push(`${match.url}/edit`)}>Edit</Button>
                    <Button onClick={() => handleRemove(supp._id, history)} className="text-danger">
                        Delete
          </Button>
                </ButtonGroup>
            </ButtonToolbar>
        </div>

        <section className="panel panel-default">
            <div className="panel-body">
                <div className="col-xs-6">
                    Margin:
          </div>
                <div className="col-xs-6">
                    {supp && supp.marginPercentage} %
        </div>
            </div>
        </section>
        <section className="panel panel-default">
            <div className="panel-body">
                <div className="col-xs-6">
                    Zoho Auth Token:
        </div>
                <div className="col-xs-6">
                    {supp && supp.zohoAuthtoken}
                </div>
            </div>
        </section>
        <section className="panel panel-default">
            <div className="panel-body">
                <div className="col-xs-6">
                    Zoho Organization Id:
        </div>
                <div className="col-xs-6">
                    {supp && supp.zohoOrganizationId}
                </div>
            </div>
        </section>

        <section className="panel panel-default">
            <div className="panel-body">
                <div className="col-xs-12">
                    Description: <br />
                    {supp && supp.description}
                </div>
            </div>
        </section>



    </div>
) : <NotFound />);

const ViewBasket = ({ loading, supp, match, history }) => (
    !loading ? renderBasket(supp, match, history) : <Loading />
);

ViewBasket.propTypes = {
    loading: PropTypes.bool.isRequired,
    basket: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default withTracker(({ match }) => {
    const basketId = match.params._id;
    const subscription = Meteor.subscribe('baskets.view', basketId);

    return {
        loading: !subscription.ready(),
        supp: Baskets.findOne(basketId) || {},
    };
})(ViewBasket);

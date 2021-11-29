import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar, ButtonGroup, Button, Row, Col } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';
import { getDayWithoutTime } from '../../../../../modules/helpers';
import { dateSettings } from '../../../../../modules/settings';
import { calculateWalletBalanceInRs} from '../../../../../modules/both/walletHelpers';
import Loading from '../../../../components/Loading/Loading';


const handleRemove = (basketId, history) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('baskets.remove', basketId, (error) => {
      if (error) {
        toast.error(error.reason);
      } else {
        toast.success('Basket deleted!');
        history.push('/baskets');
      }
    });
  }
};

const returnRow = (displayLabel, displayValue) => {
  return (
    <div className="row">
      <div className="col-xs-6">
       {displayLabel}
      </div>
      <div className="col-xs-6">
        <strong> {displayValue} </strong>
      </div>
    </div>
  )
}

export default ViewUserDetails = ({ match }) => {

  const userMobilePhone = match.params.userMobilePhone;
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [user, setUser] = useState({});

  useEffect(() => {
    Meteor.call('users.find', { mobileNumber: userMobilePhone }, (error, user)=>{
      if (error) {
        toast.error(error.reason);
      } else {
            setUser(user);
            setIsUserLoading(false);
      }
    });
  }, []);

  if (!isUserLoading ){

    const {profile, emails, eatingHealthyMeaning, wallet} = user;
    return (
      <div className="ViewUser offset-sm-1 col-xs-12 col-sm-9 col-sm-6">
      <div className="page-header clearfix">
      <h3>{`${profile.salutation} ${profile.name.first} ${profile.name.last}`}</h3>
 
      </div>

      <section className="panel panel-default">
        <div className="panel-body">
        {returnRow('Join Date', getDayWithoutTime(profile.createdAt, dateSettings.timeZone))}
        {returnRow('Mobile Phone', profile.whMobilePhone)}
        {returnRow('Email Address', emails[0].address)}
        {returnRow('Email verified?', emails[0].verified)}
        {returnRow('Delivery Address', profile.deliveryAddress)}
        {returnRow('Wallet Balance', calculateWalletBalanceInRs(wallet))}
        {returnRow('What does eating healthy mean to you?', eatingHealthyMeaning)}
        </div>
      </section>


    </div>
    );

  } else {
    return (<Loading />);
  }
};

ViewUserDetails.propTypes = {
  match: PropTypes.object.isRequired,
};

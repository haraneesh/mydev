import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  ButtonToolbar, ButtonGroup, Button, Row, Col,
} from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';
import { getDayWithoutTime } from '../../../../../modules/helpers';
import { dateSettings } from '../../../../../modules/settings';
import { calculateWalletBalanceInRs } from '../../../../../modules/both/walletHelpers';
import Loading from '../../../../components/Loading/Loading';
import constants from '../../../../../modules/constants';

const returnRow = (displayLabel, displayValue) => {
  let highLightLabel = (displayValue === constants.UserAccountStatus.Disabled.name) ? 'text-danger' : '';
  highLightLabel = (displayValue === constants.UserAccountStatus.NewSignUp.name) ? 'text-primary' : highLightLabel;

  return (
    <div className="row">
      <div className="col-xs-6">
        {displayLabel}
      </div>
      <div className={`col-xs-6 ${highLightLabel}`}>
        <strong>
          {' '}
          {displayValue}
          {' '}
        </strong>
      </div>
    </div>
  );
};

const ViewUserDetails = ({ match }) => {
  const { userMobilePhone } = match.params;
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [user, setUser] = useState({});

  useEffect(() => {
    setIsUserLoading(true);
    Meteor.call('users.find', { mobileNumber: userMobilePhone }, (error, user) => {
      if (error) {
        toast.error(error.reason);
      } else {
        setUser(user);
        setIsUserLoading(false);
      }
    });
  }, []);

  function updateAccountStatus(accountStatus) {
    setIsUserLoading(true);
    Meteor.call('users.accountStatusUpdate', { userId: user._id, accountStatus }, (error, user) => {
      if (error) {
        toast.error(error.reason);
      } else {
        setUser(user);
        setIsUserLoading(false);
      }
    });
  }

  const userAccountActionButton = (btnName, btnValueToPass) => (
    <Button onClick={() => { updateAccountStatus(btnValueToPass); }}>
      {btnName}
    </Button>
  );

  function returnActivationButtonName(status) {
    switch (status) {
      case constants.UserAccountStatus.Active.name:
        return userAccountActionButton(
          constants.UserAccountStatus.Disabled.btn_display_name,
          constants.UserAccountStatus.Disabled.name,
        );

      case constants.UserAccountStatus.Disabled.name:
        return userAccountActionButton(
          constants.UserAccountStatus.Active.btn_display_name,
          constants.UserAccountStatus.Active.name,
        );

      case constants.UserAccountStatus.NewSignUp.name:
        return (
          <div>
            {userAccountActionButton(
              constants.UserAccountStatus.Active.btn_display_name,
              constants.UserAccountStatus.Active.name,
            )}
            &nbsp;
            {userAccountActionButton(
              constants.UserAccountStatus.Disabled.btn_display_name,
              constants.UserAccountStatus.Disabled.name,
            )}
          </div>
        );
      default:
        return (<div />);
    }
  }

  if (!isUserLoading) {
    const {
      profile, emails, eatingHealthyMeaning, wallet, status,
    } = user;
    return (
      <div>
        <div className="page-header clearfix">
          <h3>{`${profile.salutation} ${profile.name.first} ${profile.name.last}`}</h3>

        </div>
        <div className="ViewUser panel panel-default offset-sm-1 col-xs-12 col-sm-9 col-sm-6">
          <section className="panel-default">
            <div className="panel-body">
              <div className="col-xs-12 offset-sm-1 col-sm-10" style={{ padding: '1em' }}>
                {returnRow('Account Status', constants.UserAccountStatus[status.accountStatus].status_display_value)}
                {returnRow('Join Date', getDayWithoutTime(profile.createdAt, dateSettings.timeZone))}
                {returnRow('Mobile Phone', profile.whMobilePhone)}
                {returnRow('Email Address', emails[0].address)}
                {returnRow('Email verified?', emails[0].verified.toString())}
                {returnRow('Delivery Address', profile.deliveryAddress)}
                {returnRow('Wallet Balance', calculateWalletBalanceInRs(wallet))}
                {returnRow('What does eating healthy mean to you?', eatingHealthyMeaning)}

                <br />
                {returnActivationButtonName(status.accountStatus)}
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }
  return (<Loading />);
};
export default ViewUserDetails;

ViewUserDetails.propTypes = {
  match: PropTypes.object.isRequired,
};

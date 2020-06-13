import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { Col } from 'react-bootstrap';
import constants from '../../../modules/constants';

const OnBehalf = ({ defaultSelectedUser, onSelectedChange, showMandatoryFields }) => {
  const refOnBehalfMemberPhone = useRef();
  const [onBehalfUser, setOnBehalfUser] = useState({ user: defaultSelectedUser, orderReceivedAs: '' });

  const findUser = () => {
    const { current } = refOnBehalfMemberPhone;
    if (current.value) {
      const mobileNumber = current.value;
      Meteor.call('users.find', { mobileNumber }, (error, user) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          if (!user){
            Bert.alert('No user was found','warning');
            return;
          } 
          const onBehalfUserTemp = { ...onBehalfUser };
          onBehalfUserTemp.user = user;
          setOnBehalfUser(onBehalfUserTemp);
          onSelectedChange(onBehalfUserTemp);
        }
      });
    }
  };

  const onOrderReceivedTypeChange = (e) => {
    const onBehalfUserTemp = { ...onBehalfUser };
    onBehalfUserTemp.orderReceivedAs = e.target.value;
    setOnBehalfUser(onBehalfUserTemp);
    onSelectedChange(onBehalfUserTemp);
  };

  return (
    <div className="row well">
      <Col xs={12}>
        <h4> Ordered User Details</h4>
      </Col>

      <Col xs={12} sm={4}>
        <label htmlFor="onBehalfUserId" type="tel"> User Phone Number</label>
      </Col>
      <Col xs={8} sm={6} style={{ paddingRight: '0px' }}>
        <input id="onBehalfUserId" className="form-control" placeholder="user phone number" ref={refOnBehalfMemberPhone} />
        { onBehalfUser.user.profile && (
          <h4><b>{`${onBehalfUser.user.profile.name.first} ${onBehalfUser.user.profile.name.last}`} </b></h4>
        )}

        {(!onBehalfUser.user.profile && showMandatoryFields) && <span className="text-danger"> Find the user who placed the order </span>}

      </Col>
      <Col xs={4} sm={2}>
        <button onClick={findUser} className="btn btn-default btn-sm"> Find </button>
      </Col>
      <Col xs={12} sm={4}>
        <label htmlFor="onBehalfReceivedMethod">How was the order received? </label>
      </Col>
      <Col xs={8} sm={6} style={{ paddingRight: '0px' }}>
        <select id="onBehalfReceived" name="onBehalfReceivedType" className="form-control" onChange={onOrderReceivedTypeChange}>
          <option value="" />
          {constants.OrderReceivedType.allowedValues.map(typ => (
            <option key={typ} value={typ}>{constants.OrderReceivedType[typ].display_value}</option>
          ))}
        </select>
        {(showMandatoryFields) && <span className="text-danger"> Order received method is necessary </span>}
      </Col>
    </div>
  );
};

OnBehalf.defaultProps = {
  defaultSelectedUser: {
    selectedUser: {},
    orderReceivedAs: '',
  },
  showMandatoryFields: false,
};

OnBehalf.propTypes = {
  onSelectedChange: PropTypes.func.isRequired,
  defaultSelectedUser: PropTypes.object,
  showMandatoryFields: PropTypes.bool,
};

export default OnBehalf;


/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import { Meteor } from 'meteor/meteor';
import loadCheckOutRzr from './loadCheckOutRzr';

class RazorPayButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loadedCheckOutScript: false };
    this.setDefaultOptions = this.setDefaultOptions.bind(this);
    this.handleOnPayButtonClick = this.handleOnPayButtonClick.bind(this);
    this.handleTransactionSuccess = this.handleTransactionSuccess.bind(this);
  }

  componentDidMount() {
    loadCheckOutRzr(() => {
      // Work to do after the library loads.
      this.setState({ loadedCheckOutScript: true });
    });
  }

  setDefaultOptions() {
    const { paymentDetails } = this.props;
    return {
      key: Meteor.settings.public.Razor.merchantKey,
      amount: paymentDetails.moneyToChargeInPaise,
      name: Meteor.settings.public.App_Name,
      protocol: 'https',
      hostname: 'api.razorpay.com',
      description: paymentDetails.description,
      image: '/logo.png',
      handler: this.handleTransactionSuccess,
      prefill: {
        name: paymentDetails.prefill.name,
        email: paymentDetails.prefill.email,
        contact: paymentDetails.prefill.contact,
      },
      notes: {
        address: paymentDetails.notes.address,
      },
      theme: {
        color: '#522E23',
      },
    };
  }

  handleOnPayButtonClick(e) {
    e.preventDefault();
    const defaultOptions = this.setDefaultOptions();
    this.rzp1 = new Razorpay(defaultOptions);
    this.rzp1.open();
  }

  handleTransactionSuccess(successMessage) {
    this.props.paymentResponseSuccess(successMessage);
  }

  render() {
    return this.state.loadedCheckOutScript ? (
      <Button
        type="button"
        onClick={this.handleOnPayButtonClick}
        variant="secondary"
      >
        {this.props.buttonText}
      </Button>
    ) : (
      <div />
    );
  }
}

RazorPayButton.defaultProps = {
  buttonText: 'Add To Wallet',
  paymentDetails: {
    moneyToChargeInPaise: 0,
    description: '',
    prefill: {
      name: '',
      email: '',
      contact: '',
    },
    notes: {
      address: '',
    },
  },
};

RazorPayButton.propTypes = {
  paymentDetails: PropTypes.object.isRequired,
  paymentResponseSuccess: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
};

export default RazorPayButton;

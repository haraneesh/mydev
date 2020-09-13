import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import {
  FormGroup, InputGroup, FormControl, Row, Col, Panel,
} from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import { formatMoney } from 'accounting-js';
import { Roles } from 'meteor/alanning:roles';
import Loading from '../../Loading/Loading';
import { accountSettings } from '../../../../modules/settings';
import constants from '../../../../modules/constants';
import validate from '../../../../modules/validate';
import RazorPayButton from '../RazorPay/RazorPayButton';
import { calculateWalletBalanceInRs } from '../../../../modules/both/walletHelpers';

const OtherPayMentOptions = () => (
  <Panel>
    <div className="panel-heading" style={{ borderRadius: '4px', fontWeight: 'bold' }}>
      <small className="text-uppercase">Pay By Apps</small>
      <p> Will reflect in 2 days on suvai</p>
    </div>
    <Col xs={12} style={{ margin: '1em 0em' }} className="text-center">
      <h3>
        <small> UPI:</small>
        {' '}
        <b>suvai@icici</b>
      </h3>
    </Col>

    <Row>
      <Col xs={12} className="text-center">
        <img style={{ maxWidth: '300px', width: '100%' }} src="/about/paymentOptions.png" />
      </Col>
    </Row>
  </Panel>
);

class AcceptPay extends React.Component {
  constructor(props) {
    super(props);
    const { userWallet } = this.props;

    this.state = this.prepareState(userWallet);

    this.amountToChargeOnChange = this.amountToChargeOnChange.bind(this);
    this.paymentResponseSuccess = this.paymentResponseSuccess.bind(this);
  }

  componentDidMount() {
    const component = this;

    validate(component.form, {
      rules: {
        amountToChargeInRs: {
          required: true,
          isMoneyInRupees: true,
        },
      },
      messages: {
        amountToChargeInRs: {
          required: 'Amount to add cannot be empty.',
          isMoneyInRupees: 'Amount can only be in one of these formats (12345 or 1234.56).',
        },
      },
      submitHandler() {
        component.handleSubmit();
      },
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.userWallet !== this.props.userWallet) {
      this.setState(this.prepareState(nextProps.userWallet));
    }
  }

  prepareState(wallet) {
    let balanceAmountClass = '';

    const netAmountInWalletInRs = calculateWalletBalanceInRs(wallet);

    switch (true) {
      case (netAmountInWalletInRs > 0):
        balanceAmountClass = 'text-success';
        break;
      case (netAmountInWalletInRs < 0):
        balanceAmountClass = 'text-danger';
        break;
      default:
        balanceAmountClass = '';
    }

    return {
      amountToChargeInRs: ((netAmountInWalletInRs < 0) ? (-1 * netAmountInWalletInRs) : 500),
      balanceAmountClass,
      paymentInProcess: false,
      netAmountInWalletInRs,
    };
  }

  amountToChargeOnChange(event) {
    // event.preventDefault();
    this.setState({
      amountToChargeInRs: event.target.value,
    });
  }

  paymentResponseSuccess(paymentSuccessMsg) {
    if (!paymentSuccessMsg.razorpay_payment_id) {
      Bert.alert(
        'We were unable to process your payment at this time. Please try a little later.',
        'danger',
      );
      return;
    }

    this.setState({
      paymentInProcess: true,
    });

    Meteor.call('payment.insert',
      {
        razorpay_payment_id: paymentSuccessMsg.razorpay_payment_id,
        amountChargedInPaise: this.state.amountToChargeInRs * 100,
      },
      (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger');

          this.setState({
            paymentInProcess: false,
          });
        } else {
          const confirmation = 'Your Wallet has been updated successfully!';
          Bert.alert(confirmation, 'success');
        }
      });
  }

  render() {
    const { loggedInUser } = this.props;

    return (
      <div>
        {this.state.paymentInProcess && (<Loading />)}
        <Panel>
          <Row>
            <Col xs={6} sm={5} className="text-right">
              <h4 style={{ paddingRight: '5px' }}>Wallet Balance</h4>
            </Col>
            <Col xs={6} sm={7} className="text-left">
              <h4 className={this.state.balanceAmountClass}>
                {`${formatMoney(this.state.netAmountInWalletInRs, accountSettings)}`}
              </h4>
            </Col>
          </Row>
        </Panel>

        <OtherPayMentOptions />

        { (Roles.userIsInRole(loggedInUser, constants.Roles.customer.name)) && (
        <Panel>

          <div className="panel-heading" style={{ borderRadius: '4px', fontWeight: 'bold' }}>
            <small className="text-uppercase">Pay On Suvai </small>
          </div>

          <form
            ref={(form) => (this.form = form)}
            onSubmit={(event) => event.preventDefault()}
          >
            <FormGroup>
              <Col xs={12} sm={8} smOffset={1} style={{ marginBottom: '1rem' }} className="rowRightSpacing">
                <InputGroup>
                  <InputGroup.Addon>Rs.</InputGroup.Addon>
                  <FormControl
                    type="number"
                    name="amountToChargeInRs"
                    value={this.state.amountToChargeInRs}
                    placeholder="500"
                    onChange={this.amountToChargeOnChange}
                  />
                </InputGroup>
              </Col>
              <Col xs={12} sm={3} className="text-right-xs">
                <RazorPayButton
                  buttonText={(this.state.netAmountInWalletInRs > 0) ? 'Add Money' : 'Pay Now'}
                  paymentDetails={{
                    moneyToChargeInPaise: this.state.amountToChargeInRs * 100,
                    description: 'Add to Wallet',
                    prefill: {
                      name: `${loggedInUser.profile.name.first} ${loggedInUser.profile.name.last}`,
                      email: loggedInUser.emails[0].address,
                      contact: loggedInUser.profile.whMobilePhone,
                    },
                    notes: {
                      address: loggedInUser.profile.deliveryAddress,
                    },
                  }}
                  paymentResponseSuccess={this.paymentResponseSuccess}
                />
              </Col>
            </FormGroup>
          </form>
        </Panel>
        )}
      </div>
    );
  }
}

AcceptPay.defaultProps = {
  loggedInUser: Meteor.user(),
};

AcceptPay.propTypes = {
  userWallet: PropTypes.shape({
    unused_retainer_payments_InPaise: PropTypes.number.isRequired,
    unused_credits_receivable_amount_InPaise: PropTypes.number.isRequired,
    outstanding_receivable_amount_InPaise: PropTypes.number.isRequired,
  }).isRequired,
  loggedInUser: PropTypes.object,
};

export default AcceptPay;

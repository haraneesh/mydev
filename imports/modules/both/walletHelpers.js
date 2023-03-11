import React from 'react';

export const isWalletUndefined = (wallet) => {
  if (wallet && wallet.hasOwnProperty('unused_credits_receivable_amount_InPaise')) {
    return false;
  }
  return true;
};

export const calculateWalletBalanceInRs = (wallet) => {
  if (!isWalletUndefined(wallet)) {
    const walletBalance = (wallet.unused_retainer_payments_InPaise
        + wallet.unused_credits_receivable_amount_InPaise
      - wallet.outstanding_receivable_amount_InPaise
    ) / 100;

    return Math.floor(walletBalance * 100) / 100;
  }

  return 0;
};

export const isEligibleToSignUpForDiscount = (wallet) => {
  const walletBalance = calculateWalletBalanceInRs(wallet);
  const discountActiveUntilDate = (wallet && wallet.discountActiveUntilDate)
    ? wallet.discountActiveUntilDate
    : new Date();
  const today = new Date();
  if (walletBalance > 0 && discountActiveUntilDate.getTime() >= today.getTime()) {
    return true;
  }
  return false;
};

export const SignUpForDiscountMessage = ({ wallet }) => {
  if (isEligibleToSignUpForDiscount(wallet)) {
    return (
      <div>
        <h4>You are Eligible for an offer!</h4>
        <small>
          If you add Rs. 5000 or more to your wallet, you will get
          <span className="text-warning">
            {' '}
            20% discount
            {' '}
          </span>
          on all your purchases for the next 30 days up to Rs. 6000
        </small>
      </div>
    );
  }
  return <></>;
};

export const newWallet = ({ wallet, add_outstanding_receivable_amount_InPaise }) => ({
  unused_retainer_payments_InPaise: wallet.unused_retainer_payments_InPaise,
  unused_credits_receivable_amount_InPaise: wallet.unused_credits_receivable_amount_InPaise,
  outstanding_receivable_amount_InPaise:
      wallet.outstanding_receivable_amount_InPaise + add_outstanding_receivable_amount_InPaise,

});

export const calculateGateWayFee = (amount) => (amount * 0.02);

export const prepareState = (wallet) => {
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

  const amtToChrg = ((netAmountInWalletInRs < 0) ? (-1 * netAmountInWalletInRs) : 5000);

  return {
    amountToChargeInRs: amtToChrg,
    balanceAmountClass,
    netAmountInWalletInRs,
    gateWayFee: calculateGateWayFee(amtToChrg),
    isError: {
      amountToChargeInRs: '',
    },
  };
};

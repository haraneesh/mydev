export const isWalletUndefined = (wallet) => {
  if (wallet && wallet.hasOwnProperty('unused_credits_receivable_amount_InPaise')) {
    return false;
  }
  return true;
};

export const calculateWalletBalanceInRs = (wallet) => {
  if (!isWalletUndefined(wallet)) {
    return (
      (wallet.unused_retainer_payments_InPaise + wallet.unused_credits_receivable_amount_InPaise)
      - wallet.outstanding_receivable_amount_InPaise
    ) / 100;
  }

  return 0;
};

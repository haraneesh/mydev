export const calculateWalletBalanceInRs = wallet => (
    (
      (wallet.unused_retainer_payments_InPaise + wallet.unused_credits_receivable_amount_InPaise)
      - wallet.outstanding_receivable_amount_InPaise
    ) / 100);

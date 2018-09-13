function getTomorrowDateOnServer() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

function getIncrementedDateOnServer(dateToIncrement, increment) {
  const currentDate = dateToIncrement
  currentDate.setDate(currentDate.getDate() + increment);
  return currentDate;
}

function getInvoiceTotals(invoices) {
  if (!invoices) return;

  return invoices.reduce(
    (previousValue, currentValue) => ({
      balanceInvoicedAmount:
        previousValue.balanceInvoicedAmount +
        currentValue.balanceInvoicedAmount,
      totalInvoicedAmount:
        previousValue.totalInvoicedAmount + currentValue.totalInvoicedAmount,
    }),
    {
      balanceInvoicedAmount: 0,
      totalInvoicedAmount: 0,
    },
  );
}

function adjustBalanceByTransactionCharges(amount) {
  const paymentServiceChargePercentage = 0.2;
  return (amount * paymentServiceChargePercentage) + amount;
}

const orderCommon = {
  getInvoiceTotals,
  adjustBalanceByTransactionCharges,
  getTomorrowDateOnServer,
  getIncrementedDateOnServer,
};

export default orderCommon;

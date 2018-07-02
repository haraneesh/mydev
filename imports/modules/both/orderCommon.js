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

const orderCommon = {
  getInvoiceTotals,
};

export default orderCommon;

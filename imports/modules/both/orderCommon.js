function getTomorrowDateOnServer() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

function getIncrementedDateOnServer(dateToIncrement, increment) {
  const currentDate = dateToIncrement;
  currentDate.setDate(currentDate.getDate() + increment);
  return currentDate;
}

function getInvoiceTotals(invoices) {
  if (!invoices) return;

  return invoices.reduce(
    (previousValue, currentValue) => ({
      balanceInvoicedAmount:
        previousValue.balanceInvoicedAmount
        + currentValue.balanceInvoicedAmount,
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

function costOfReturnable(returnableUnitsForSelection, mainProductQuantity) {
  const retPriceHash = {};
  const priceArray = returnableUnitsForSelection.split(',');
  priceArray.forEach((elem) => {
    const qtyPrice = elem.split('=');
    const qtyUnit = qtyPrice[0].trim();
    retPriceHash[qtyUnit] = qtyPrice[1];
  });

  const keys = Object.keys(retPriceHash);
  keys.sort((a, b) => retPriceHash[a] - retPriceHash[b]).forEach((k) => {
    retPriceHash[k] = retPriceHash[k];
  });

  const k = keys.find((key) => (key > mainProductQuantity));
  const key = (k) || keys[keys.length - 1];
  return { retQtySelected: Number(key), retQtySelectedPrice: retPriceHash[key] };
}

const orderCommon = {
  getInvoiceTotals,
  adjustBalanceByTransactionCharges,
  getTomorrowDateOnServer,
  getIncrementedDateOnServer,
  costOfReturnable,
};

export default orderCommon;

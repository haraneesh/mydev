import zh from './ZohoBooks';

function getCustomerCreditNotes(zhCustomerId){
  const response = zh.getRecordsByParams('creditnotes', {
    customer_id: zhCustomerId,
  });
  return response;
}

const zohoCreditNotes = {
  getCustomerCreditNotes,
};

export default zohoCreditNotes;

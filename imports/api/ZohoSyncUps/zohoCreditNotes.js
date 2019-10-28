import zh from './ZohoBooks';

function getCustomerCreditNotes(zhCustomerId){
  const response = zh.getRecordsByParams('creditnotes', {
    customer_id: zhCustomerId,
  });
  return response;
}

function getCreditNote(creditNoteId){
  const response = zh.getRecordById('creditnotes', creditNoteId);
  return response;
}

const zohoCreditNotes = {
  getCustomerCreditNotes,
  getCreditNote,
};

export default zohoCreditNotes;

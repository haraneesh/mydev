import zh from './ZohoBooks';

async function getCustomerCreditNotes(zhCustomerId){
  const response = await zh.getRecordsByParams('creditnotes', {
    customer_id: zhCustomerId,
  });
  return response;
}

async function getCreditNote(creditNoteId){
  const response = await zh.getRecordById('creditnotes', creditNoteId);
  return response;
}

const zohoCreditNotes = {
  getCustomerCreditNotes,
  getCreditNote,
};

export default zohoCreditNotes;

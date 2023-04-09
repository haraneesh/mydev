/*
document.getElementsByClassName('trpadding')[0]
.getElementsByClassName('itemBody')[0]
.getElementsByTagName("tr")[0]
.getElementsByTagName("td")[1].innerText
*/
import React from 'react';
import { formatMoney } from 'accounting-js';
import constants from '../../../../modules/constants';
import { accountSettings } from '../../../../modules/settings';

const IGNORETERMS = ['Credits Applied', 'Payment Applied'];

function getRowElements(tableRow) {
  const trElem = tableRow.getElementsByTagName('td');
  const jsonRow = {
    displayDate: trElem[0].innerText,
    transactionType: trElem[1].innerText,
    transactionDetails: trElem[2].innerText,
    amount: trElem[3].innerText,
    payment: trElem[4].innerText,
    balance: trElem[5].innerText,
  };
  return jsonRow;
}

function jsonRowsToHtml(jsonRows) {
  const lastRow = jsonRows.length;
  let amount = '';

  const htmlRows = jsonRows.map((row, index) => {
    let { transactionType } = row;
    if (IGNORETERMS.indexOf(row.transactionType) === -1) {
      switch (transactionType) {
        case 'Invoice':
          transactionType = 'Ordered';
          amount = formatMoney(row.amount.replace(',', ''), accountSettings);
          break;
        case 'Credit Note':
          transactionType = 'Refund';
          amount = `${formatMoney(row.amount.replace(/[,()\s]/g, ''), accountSettings)} (R)`;
          break;
        default:
          amount = formatMoney(row.payment.replace(',', ''), accountSettings);
          break;
      }

      const walletBalance = row.balance.replace(',', '') * -1;

      if (index > 0) {
        return (
          <>
            <tr key={`d-${index}`}>

              <td>{row.displayDate}</td>
              {(transactionType === 'Ordered') ? (
                <>
                  <td>{amount}</td>
                  <td />
                </>
              ) : (
                <>
                  <td />
                  <td>{amount}</td>
                </>
              )}

            </tr>
            {(index === lastRow - 1) && (
            <tr key={index}>
              <td colSpan="3" className="text-center">
                Closing Balance:
                {' '}
                {`${formatMoney(walletBalance, accountSettings)}`}
              </td>
            </tr>
            )}
          </>

        );
      }

      return (
        <tr key={index}>
          <td colSpan="3" className="text-center">
            Opening Balance:
            {' '}
            {`${formatMoney(walletBalance, accountSettings)}`}
          </td>
        </tr>
      );
    }
  });

  return (
    <table className="table table-striped table-bordered text-center">
      <thead>
        <tr>
          <th>Date</th>
          <th>Bill Value</th>
          <th>Payment</th>
        </tr>
      </thead>
      <tbody>

        {htmlRows}
      </tbody>
    </table>
  );
}

function processHTMLTable(htmlElement, timePeriod) {
  const table = htmlElement.getElementsByClassName('trpadding')[0];
  const tableBody = table.getElementsByClassName('itemBody')[0];
  const tableRows = tableBody.getElementsByTagName('tr');

  const jsonRows = Object.keys(tableRows).map((index) => getRowElements(tableRows[index]));
  return (
    <div className="card p-sm-3">
      <h4 className="card-header text-center py-3">
        Statement for
        {' '}
        <b>{constants.StatementPeriod[timePeriod].display_value}</b>
      </h4>
      <div className="pt-2">
        {jsonRowsToHtml(jsonRows)}
      </div>
    </div>
  );
}

export default processHTMLTable;

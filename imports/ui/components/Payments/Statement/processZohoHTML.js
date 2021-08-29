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
  const htmlRows = jsonRows.map((row, index) => {
    let { transactionType } = row;
    if (IGNORETERMS.indexOf(row.transactionType) === -1) {
      switch (transactionType) {
        case 'Invoice':
          transactionType = 'Ordered';
          break;
        case 'Credit Note':
          transactionType = 'Refund';
          break;
        default:
          break;
      }

      const walletBallance = row.balance.replace(',', '') * -1;
      return (
        <>
          <tr key={index}>
            <td colSpan="3">{transactionType}</td>
          </tr>
          <tr key={`d-${index}`}>
            <td>{row.displayDate}</td>
            <td>{(row.amount && index > 0) ? row.amount : row.payment}</td>
            <td>{`${formatMoney(walletBallance, accountSettings)}`}</td>
          </tr>
        </>
      );
    }
  });

  return (
    <table className="table table-striped">
      <thead>
        <th>Date</th>
        <th>Amount</th>
        <th style={{ paddingLeft: '5px' }}>Wallet</th>
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
    <div className="panel panel-default">
      <div className="panel-heading text-center">
        Statement for
        {' '}
        <b>{constants.StatementPeriod[timePeriod].display_value}</b>
      </div>
      <div className="panel-body">
        {jsonRowsToHtml(jsonRows)}
      </div>
    </div>
  );
}

export default processHTMLTable;

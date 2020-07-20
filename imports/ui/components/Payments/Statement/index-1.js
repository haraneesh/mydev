import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import { Row, Table, Col, Panel } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import { pdfjs, Document, Page } from 'react-pdf';
import { getFormattedMoney, getDayWithoutTime } from '../../../../modules/helpers';

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


function toUTF8Array(str) {
  const utf8 = [];
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6),
        0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f));
    }
    // surrogate pair
    else {
      i++;
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charcode = 0x10000 + (((charcode & 0x3ff) << 10)
                      | (str.charCodeAt(i) & 0x3ff));
      utf8.push(0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f));
    }
  }
  return utf8;
}

const ShowStatement = () => {
  const [isStatementstLoading, setIsLoading] = useState(true);
  const [pdfFile, setPdfFile] = useState([]);

  const loadStatement = () => {
    setIsLoading(true);
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
    Meteor.call('customer.getStatement', {
      accept: 'json',
      fromDate: '2020-06-01',
      toDate: '2020-06-30',
    }, (error, xlsFile) => {
      setIsLoading(false);
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        // let strToByteArr = stringToBytes(xlsFile);
        // setPdfFile(new Uint8Array(xlsFile));

        setPdfFile(xlsFile);

        // const reportWindow = window.open('', 'Summary Statement');
        // reportWindow.document.write(xlsFile);
        /* const pdfWindow = window.open('');
        pdfWindow.document.write(

          decodeURIComponent(xlsFile),


        ); */


        // window.open(`data:application/pdf;base64, ${encodeURI(xlsFile)}`);
        /*
        const element = document.createElement('a');
        element.setAttribute('href', xlsFile); // `data:application/pdf;base64,${encodeURI(xlsFile)}`
        element.setAttribute('download', 'statement.pdf');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element); */
      }
    },
    );
  };
  // pdfjs.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.js';
  // pdfjs.worderSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

 // const blob = new Blob([pdfFile], { type: 'application/pdf' });
 // const url = window.URL.createObjectURL(blob);

  return !isStatementstLoading ? (
    <Panel>
      <Document
        file={{
           data: pdfFile,
          //url,
        }}
        onLoadSuccess={pdf => alert(`Loaded a file with ${pdf.numPages} pages!`)}
      >
        <Page pageNumber={3} onRenderSuccess={() => alert('Rendered the page!')} onRenderError={(error) => alert('Error while loading page! ' + error.message)}/>
      </Document>
    </Panel>

  ) : (<Panel> <button className="btn btn-sm btn-primary" onClick={loadStatement}> Fetch Statement </button> </Panel>);
};

export default ShowStatement;


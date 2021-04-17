import React from 'react';
import {
  Row, Col, Label, Glyphicon, ListGroupItem, Panel, PanelGroup,
} from 'react-bootstrap';
import { formatMoney } from 'accounting-js';
import { renderToStaticMarkup } from 'react-dom/server';
import moment from 'moment';
import { accountSettings, dateSettings, dateSettingsWithTime } from '../../../modules/settings';
import 'moment-timezone';
import jspdf from '../../../libs/jspdf.min';

class GenerateOrderBills_prev {
  constructor(pageX = 20, pageY = 60, rowHeight = 30, titleFontSize = 18, bodyFontSize = 14) {
    this.pageX = pageX;
    this.pageY = pageY;
    this.rowHeight = rowHeight;
    this.titleFontSize = titleFontSize;
    this.bodyFontSize = bodyFontSize;

    // we support special element handlers. Register them with jQuery-style
    // ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
    // There is no support for any other type of selectors
    // (class, of compound) at this time.
    specialElementHandlers = {
      // element with id of "bypass" - jQuery style selector
      '#bypassme': function (element, renderer) {
        // true = "handled elsewhere, bypass text extraction"
        return true;
      },
    };

    /* margins = {
            top: 80,
            bottom: 60,
            left: 40,
            width: 522
        }; */

    this.pdf = new jspdf('l', 'pt', 'a4');
  }

  _readyOrderSummaryToPrint(rowsDetails) {
    this.pdf.setFontSize(this.titleFontSize);
    this._printTextRow(this.pageX, this.pageY, this.rowHeight, 'Suvai', this.pdf);
    this.pdf.setFontSize(this.bodyFontSize);
    this._printTextRow(this.pageX + 45, this.pageY, 30, ' - OPL Report, Status Considered: Awaiting Fullfilment ', this.pdf);
    const today = new Date();
    this.pageY = this._printTextRow(this.pageX + 400, this.pageY, this.rowHeight,
      `Date of Report:${moment(today).tz(dateSettingsWithTime.timeZone).format(dateSettingsWithTime.format)}`, this.pdf);

    // this.pageY =  this.pageY + this.rowHeight
    this._writeOrderSummaryDetails(rowsDetails);
  }

  _writeOrderSummaryDetails(rowsDetails) {
    // const products = rowsDetails.products
    const headers = [{
      name: 'column1',
      prompt: 'Product Name',
      width: '400',
      align: 'left',
      padding: 1,
    }, {
      name: 'column2',
      prompt: 'Unit of Sale',
      width: '200',
      align: 'left',
      padding: 4,
    }, {
      name: 'column3',
      prompt: 'Total Quantity',
      width: '200',
      align: 'left',
      padding: 4,
    },
    ];

    let rows = [];

    rows = rowsDetails.reduce((rows, rowDetail) => {
      if (rowDetail.totalQuantity > 0) {
        rows.push(
          {
            column1: rowDetail._id['products.name'],
            column2: rowDetail._id['products.unitOfSale'],
            column3: rowDetail.totalQuantity,
          },
        );
      }
      return rows;
    }, []);

    this.pdf.table(this.pageX, this.pageY, rows, headers, {
      autoSize: false,
      printHeaders: true,
      rowMargin: 0,
      fontSize: this.bodyFontSize,
    });
  }

  PrintOPL(groupedOrderSummary /* grouped list of orders */) {
    this._readyOrderSummaryToPrint(groupedOrderSummary);
    this.pdf.output('dataurlnewwindow');
  }

  PrintOrderBills(ordersToPrint /* selected list of orders */) {
    const totalOrders = ordersToPrint.length;
    _.each(ordersToPrint, function (order, key) {
      this._readyOrderToPrint(ordersToPrint[key]);
      const notLastOrder = totalOrders > (key + 1);
      if (notLastOrder) {
        this.pdf.addPage();
      }
    }, this);

    this.pdf.output('dataurlnewwindow');
  }

  _printTextRow(pageX, pageY, rowHeight, value, pdf) {
    pdf.text(pageX, pageY, value);
    return pageY + rowHeight;
  }

  _readyOrderToPrint(order) {
    this.pdf.setFontSize(this.titleFontSize);
    this._printTextRow(this.pageX, this.pageY, this.rowHeight, 'Suvai', this.pdf);
    this.pdf.setFontSize(this.bodyFontSize);
    this._printTextRow(this.pageX + 45, this.pageY, 30, ' - Eat Healthy, Live Healthy', this.pdf);
    this.pageY = this._printTextRow(this.pageX + 400, this.pageY, this.rowHeight,
      moment(order.createdAt).tz(dateSettings.timeZone).format(dateSettings.format), this.pdf);
    if (order.customer_details.deliveryAddress) {
      this.pageY = this._printTextRow(this.pageX, this.pageY, this.rowHeight, order.customer_details.deliveryAddress, this.pdf);
    }

    this._writeOrderProductDetails(order);
    this._printTextRow(this.pageX, this.pageY, this.rowHeight, order.comments, this.pdf);
  }

  _writeOrderProductDetails(order) {
    const { products } = order;
    const headers = [{
      name: 'column1',
      prompt: 'Name',
      width: '400',
      align: 'left',
      padding: 1,
    }, {
      name: 'column2',
      prompt: 'Qty x Price',
      width: '200',
      align: 'left',
      padding: 4,
    }, {
      name: 'column3',
      prompt: 'Total',
      width: '200',
      align: 'left',
      padding: 4,
    },
    ];

    let rows = [];

    rows = products.reduce((rows, product) => {
      if (product.quantity > 0) {
        rows.push(
          {
            column1: `${product.name} ${product.unitOfSale}`,
            column2: `${product.quantity} x ${formatMoney(product.unitprice, accountSettings)}`,
            column3: formatMoney(product.unitprice * product.quantity, accountSettings),
          },
        );
      }
      return rows;
    }, []);

    rows.push({
      column1: '',
      column2: 'Sub Total',
      column3: formatMoney(order.total_bill_amount, accountSettings),
    });

    this.pdf.table(this.pageX, this.pageY, rows, headers, {
      autoSize: false,
      printHeaders: true,
      rowMargin: 0,
      fontSize: this.bodyFontSize,
    });
    this.pageY += (products.length + 2) * this.rowHeight;
  }
}

export default GenerateOrderBills_prev;

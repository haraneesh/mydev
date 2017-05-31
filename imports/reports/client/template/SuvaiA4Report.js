import jspdf from '../../../libs/jspdf.min'

export default class SuvaiA4Report{
    constructor(leftMargin = 20, rowBegin = 60, titleRowHeight = 45, rowHeight = 30, titleFontSize = 18, bodyFontSize = 14)
    {
        this.initialValues = {
            leftMargin,
            rowBegin,
            titleRowHeight,
            rowHeight,
            titleFontSize,
            bodyFontSize
        }
        this.setReset()
    }

    setReset(){
        this.pageX = this.initialValues.leftMargin
        this.pageY = this.initialValues.rowBegin
        this.LeftMargin = this.initialValues.leftMargin
        this.rowHeight = this.initialValues.rowHeight
        this.titleRowHeight = this.initialValues.titleRowHeight
        this.titleFontSize = this.initialValues.titleFontSize
        this.bodyFontSize = this.initialValues.bodyFontSize

        //we support special element handlers. Register them with jQuery-style 
        // ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
        // There is no support for any other type of selectors 
        // (class, of compound) at this time.
        specialElementHandlers = {
            // element with id of "bypass" - jQuery style selector
            '#bypassme': function(element, renderer) {
                // true = "handled elsewhere, bypass text extraction"
                return true
            }
        };

       /* margins = {
            top: 80,
            bottom: 60,
            left: 40,
            width: 522
        };*/

        this.pdf = new jspdf('p', 'pt', 'a4');
    }

    printTitle(value){
        if (!value) {
             throw new Meteor.Error(400, "Value to be printed in mandatory")
        }
        this.pdf.setFontSize(this.titleFontSize)
        this.pdf.text (this.pageX, this.pageY, value)
        this.pdf.setFontSize(this.bodyFontSize)
    }

    printText(value, columnIncr = 0){
        if (!value) {
             throw new Meteor.Error(400, "Value to be printed in mandatory")
        }
        this.pageX = this.LeftMargin + columnIncr
        this.pdf.text (this.pageX, this.pageY, value)
    }

    addNewTitleRow(){
        this.pageY = this.pageY + this.titleRowHeight
        this.pageX = this.LeftMargin
    } 

    addNewSectionRow(){
        this.pageY = this.pageY + this.rowHeight
        this.pageX = this.LeftMargin
    }

    addNewRow(){
        this.pageY = this.pageY + this.rowHeight/2
        this.pageX = this.LeftMargin
    }

    printTable(rows, headers, autoSize = false, printHeaders = true){
        if (!rows || (printHeaders && !headers)) {
             throw new Meteor.Error(400, "Header and Data rows are to be printed are mandatory")
        }
        this.pdf.table(this.pageX, this.pageY, rows, headers, {
            autoSize: autoSize,
            printHeaders: printHeaders,
            rowMargin: 0,
            fontSize: this.bodyFontSize
        });

        this.pageY = this.pageY + (rows.length) * this.rowHeight
    }

    addPage(){
        this.setReset();
        this.pdf.addPage()
    }

    generateReport(){
        this.pdf.output("dataurlnewwindow")
    }
}

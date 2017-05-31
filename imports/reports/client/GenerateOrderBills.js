import { formatMoney } from 'accounting-js'
import { accountSettings, dateSettings, dateSettingsWithTime } from '../../modules/settings'
import { renderToStaticMarkup } from 'react-dom/server'
import moment from 'moment'
import 'moment-timezone'
import SuvaiA4Report from './template/SuvaiA4Report'

export default class GenerateOrderBills {
    constructor(){
        this.suvaiA4Report = new SuvaiA4Report()
    }

    PrintOrderBills(ordersToPrint /* selected list of orders */){
        let totalOrders = ordersToPrint.length
          _.each(ordersToPrint, function(order, key){
              this._readyOrderToPrint(ordersToPrint[key])
              /*let notLastOrder = totalOrders > (key + 1) 
              if (notLastOrder) {
                    this.suvaiA4Report.addPage()
                }*/
            },this)

            this.suvaiA4Report.generateReport()
    }

    _readyOrderToPrint(order){
       //this.pdf.setFontSize(this.titleFontSize)
       //this._printTextRow(this.pageX, this.pageY, this.rowHeight,"Suvai",this.pdf )
       this.suvaiA4Report.printTitle("Suvai")
       //this.pdf.setFontSize(this.bodyFontSize)
       //this._printTextRow(this.pageX + 45, this.pageY, 30," - Affordably, Healthy Organic Foods ",this.pdf )
       //this.pageY = this._printTextRow(this.pageX + 400, this.pageY, this.rowHeight, 
       //              moment(order.createdAt).tz(dateSettings.timeZone).format(dateSettings.format),this.pdf )
       this.suvaiA4Report.printText( moment(order.createdAt).tz(dateSettings.timeZone).format(dateSettings.format), 400)              
       this.suvaiA4Report.addNewSectionRow()
       this.suvaiA4Report.printText(order.customer_details.name)
       
       if (order.customer_details.deliveryAddress){   
              this.suvaiA4Report.addNewRow()
              this.suvaiA4Report.printText(order.customer_details.deliveryAddress)
       }
       this._writeOrderProductDetails(order)

       if (order.comments){
              this.suvaiA4Report.printText(order.comments)
       }
    } 

   _writeOrderProductDetails (order) {
        const products = order.products
        let headers = [{
            "name":"column1",
            "prompt":"Name",
            "width":"350",
            "align":"left",
            "padding":1
            }, {
            "name":"column2",
            "prompt":"Qty / Price",
            "width":"200",
            "align":"left",
            "padding":4
            }, {
            "name":"column3",
            "prompt":"Total",
            "width":"180",
            "align":"left",
            "padding":4
            }
        ];

        let rows = []
            
        rows = products.reduce((rows, product) =>{
                    if (product.quantity > 0)
                    {
                        rows.push(
                            {
                                "column1":product.name + " " + product.unitOfSale,
                                "column2":product.quantity + " x "  + formatMoney(product.unitprice,accountSettings),
                                "column3": formatMoney(product.unitprice * product.quantity, accountSettings)
                            }
                        )
                    }
                    return rows
            }, []
        )

        rows.push({
            "column1":"",
            "column2":"Sub Total",
            "column3": formatMoney(order.total_bill_amount, accountSettings)
        })

        this.suvaiA4Report.addNewRow()
        this.suvaiA4Report.printTable(rows, headers)
    }
}

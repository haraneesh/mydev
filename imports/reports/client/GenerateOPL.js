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
    
    _writeOrderSummaryDetails (rowsDetails) {
        //const products = rowsDetails.products
        let headers = [{
            "name":"column1",
            "prompt":"Product Name",
            "width":"350",
            "align":"left",
            "padding":1
            }, {
            "name":"column2",
            "prompt":"Unit of Sale",
            "width":"200",
            "align":"left",
            "padding":4
            }, {
            "name":"column3",
            "prompt":"Total Quantity",
            "width":"180",
            "align":"left",
            "padding":4
            }
        ];

        let rows = []
            
        rows = rowsDetails.reduce((rows, rowDetail) =>{
                    if (rowDetail.totalQuantity > 0)
                    {
                        rows.push(
                            {
                                "column1":rowDetail._id["products.name"],
                                "column2":rowDetail._id["products.unitOfSale"],
                                "column3":rowDetail.totalQuantity
                            }
                        )
                    }
                    return rows
            }, []
        )

        this.suvaiA4Report.printTable(rows, headers)
        this.suvaiA4Report.generateReport()
    }

    _readyOrderSummaryToPrint(rowsDetails){
        this.suvaiA4Report.printTitle("Suvai")
        this.suvaiA4Report.printText(" - OPL Report, Status Considered: Awaiting Fullfilment ",45)
        this.suvaiA4Report.addNewRow()
        const today = new Date()
        this.suvaiA4Report.printText("Date of Report:" +  moment(today).tz(dateSettingsWithTime.timeZone).format(dateSettingsWithTime.format))
        this.suvaiA4Report.addNewRow()
        this._writeOrderSummaryDetails(rowsDetails)
    }

    PrintOPL(groupedOrderSummary /* grouped list of orders */){
        this._readyOrderSummaryToPrint(groupedOrderSummary)
    }
}
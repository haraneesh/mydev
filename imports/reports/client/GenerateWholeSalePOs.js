import moment from 'moment';
import 'moment-timezone';
import { dateSettings } from '../../modules/settings';


class GenerateWholeSalePOs {

    static exportPOsAsCSV = (rowDetails) => {
        var csv = [];
        const today = new Date();
        const POdate = moment(today).tz(dateSettings.timeZone).format(dateSettings.zhPayDateFormat);
        csv.push('Purchase Order Date, Purchase Order Number, Vendor Name, SKU,Item Price, Item Name, Quantity');
        for (var i = 0; i < rowDetails.length; i++) {
            const { _id, totalQuantity } = rowDetails[i];
            csv.push(`${POdate},PO1,, ${_id.productSKU},${_id.productWSaleBaseUnitPrice},${_id.productName},${totalQuantity}`);
        }
        this.downloadFile(csv, POdate);
    }

    static downloadFile = (csv, POdate) => {
        let element = document.createElement('a');

        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv.join("\r\n")));
        element.setAttribute('download', `POs_${POdate}.csv`);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
}

export default GenerateWholeSalePOs.exportPOsAsCSV;

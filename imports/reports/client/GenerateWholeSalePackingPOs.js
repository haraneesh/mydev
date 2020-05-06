import moment from 'moment';
import 'moment-timezone';
import { dateSettings } from '../../modules/settings';
import { displayUnitOfSale } from '../../modules/helpers';


class GenerateWholeSalePackingPOs {

    static convertToBuyerHash = (results) => {
        const rObj = {};
        const uniqueSKUs = {};
        const uniqueCustomers = {};

        results.forEach((result) => {
            const r = result._id;
            if (!(r.customerId in rObj)) {
                rObj[r.customerId] = {};
                rObj[r.customerId]['customerName'] = r.customerName;
            }
            if (!(r.productSKU in rObj[r.customerId])) {
                rObj[r.customerId][r.productSKU] = {};
            }

            rObj[r.customerId][r.productSKU] = {
                productSKU: r.productSKU,
                productName: r.productName,
                productWSaleBaseUnitPrice: r.productWSaleBaseUnitPrice,
                productUnitOfSale: r.productUnitOfSale,
                totalQuantity: result.totalQuantity,
            }

            if (!(r.productSKU in uniqueSKUs)) {
                uniqueSKUs[r.productSKU] = { productName: r.productName };
            }

            if (!(r.customerId in uniqueCustomers)) {
                uniqueCustomers[r.customerId] = { customerName: r.customerName };
            }
        })

        return {
            rObj,
            uniqueSKUs,
            uniqueCustomers,
        }
    };

    static exportPOsAsCSV = (rowDetails) => {
        var csv = [];
        const today = new Date();
        const buyerHash = this.convertToBuyerHash(rowDetails);

        const POdate = moment(today).tz(dateSettings.timeZone).format(dateSettings.zhPayDateFormat);

        const customerIds = Object.keys(buyerHash.uniqueCustomers);

        let csvHeading = 'Product SKU, Product Name';
        customerIds.forEach(customerId => {
            csvHeading += ',' + buyerHash.uniqueCustomers[customerId].customerName;
        });
        csv.push(csvHeading);

        Object.keys(buyerHash.uniqueSKUs).forEach(productSKU => {

            let csvRow = productSKU + ',' + buyerHash.uniqueSKUs[productSKU].productName;
            customerIds.forEach(customerId => {
                const customerRow = buyerHash.rObj[customerId];

                if (!(productSKU in customerRow)) {
                    csvRow += ',';
                } else {
                    csvRow += ',' + displayUnitOfSale(customerRow[productSKU].totalQuantity, customerRow[productSKU].productUnitOfSale);
                }

            });

            csv.push(csvRow);


        });

        this.downloadFile(csv, POdate);
    }

    static downloadFile = (csv, POdate) => {
        let element = document.createElement('a');

        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv.join("\r\n")));
        element.setAttribute('download', `PackingPOs_${POdate}.csv`);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
}

export default GenerateWholeSalePackingPOs.exportPOsAsCSV;

import constants from './constants'
import { accountSettings, dateSettings } from './settings'
import moment from 'moment';
import 'moment-timezone';
import { formatMoney } from 'accounting-js'

export function getDisplayDateTitle(startDateObj, EndDateObj){

    return  getDisplayDate(startDateObj)
             + " - " +
            getDisplayDate(EndDateObj)

}

export function getDisplayDate(dateObject){
    return moment(dateObject).tz(dateSettings.timeZone).format(dateSettings.format)
}

export function getProductListStatus(activeStartDateTime, activeEndDateTime){
    const today = moment().tz(dateSettings.timeZone)
    let productList_status =   today.isAfter(activeEndDateTime)? constants.ProductListStatus.Expired.name : null

    productList_status =   today.isBefore(activeStartDateTime) ?
            constants.ProductListStatus.Future.name : constants.ProductListStatus.Active_Now.name

      return productList_status
}

export function getFormattedMoney(money){
    return formatMoney(money, accountSettings) 
}
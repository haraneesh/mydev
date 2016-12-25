import constants from './constants'
import { accountSettings, dateSettings } from './settings'
import moment from 'moment';
import 'moment-timezone';
import { formatMoney } from 'accounting-js'

export function getDisplayDates2(startDateObj, EndDateObj){

    return  getDisplayDate(startDateObj)
             + " - " +
            getDisplayDate(EndDateObj)

}

export function getDisplayDate(dateObject){
    return moment(dateObject).tz(dateSettings.timeZone).format(dateSettings.format)
}

export function getDateDisplayStatus(activeStartDateTime, activeEndDateTime){
    const today = moment().tz(dateSettings.timeZone)
    let productList_status =   today.isAfter(activeEndDateTime)? constants.ProductListStatus.Expired.name : null

    productList_status =   today.isBefore(activeStartDateTime) ?
            constants.ProductListStatus.Future.name : constants.ProductListStatus.Active_Now.name

      return productList_status
}

export function getDateStatusLabel(activeStartDateTime, activeEndDateTime){
      const status = getDateDisplayStatus(activeStartDateTime, activeEndDateTime)
      return constants.ProductListStatus[status].label
}

export function getFormattedMoney(money){
    return formatMoney(money, accountSettings) 
}
import React from 'react'
import { Cell } from 'fixed-data-table-2'
import { Label, Checkbox,  FormIn } from 'react-bootstrap'
import LoadImage from './helpers/LoadImage'
import { formatMoney } from 'accounting-js'
import { accountSettings, dateSettings } from '../settings'
import moment from 'moment';
import 'moment-timezone';

export const DateCell = ({rowIndex, data, col, ...props}) => (
  <Cell {...props}>
    {moment(data[rowIndex][col]).tz(dateSettings.timeZone).format(dateSettings.format)}
  </Cell>
)

export const RowSelectedCell = ({rowIndex, data, col, onChecked, ...props}) => {
    const isChecked = data[rowIndex][col] 
    return (
       <Cell {...props} > <Checkbox onClick = { (e) => {  e.stopPropagation(); onChecked(e, rowIndex); } } 
            value = { isChecked }  /> </Cell> 

       /* <Cell {...props} > <input type = "checkbox" onClick = { (e) => { onChecked(e, rowIndex); e.stopPropagation();} } 
        /> </Cell> */
  )
}

export const OrderStatusCell = ({rowIndex, data, col, ...props}) => {
    const order_status = data[rowIndex][col] 
    const labelStyle = constants.OrderStatus[order_status].label
    const statusToDisplay = constants.OrderStatus[order_status].display_value
   return (
    <Cell {...props} > <Label bsStyle = { labelStyle }> { statusToDisplay } </Label> </Cell>
  )
}

export const ImageCell = ({rowIndex, data, col, ...props}) => (
  <LoadImage
    src={ data[rowIndex][col] }
  />
)

export const LinkCell = ({rowIndex, data, col, callBack, ...props}) => {
  if (callBack){
      return(
        <Cell {...props}>
          <a onClick = { (e) => { e.stopPropagation(); callBack (e, rowIndex); } } >{data[rowIndex][col]}</a>
        </Cell>
      )
  } else {
      return TextCell ({rowIndex, data, col, ...props})
  }
}

export const TextCell = ({rowIndex, data, col, ...props}) => (
  <Cell {...props}>
    {data[rowIndex][col]}
  </Cell>
)

export const AmountCell = ({rowIndex, data, col, ...props}) =>(
  <Cell {...props}>
    {formatMoney(data[rowIndex][col], accountSettings)}
  </Cell>
)
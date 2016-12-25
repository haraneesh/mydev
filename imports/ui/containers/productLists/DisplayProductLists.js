import { composeWithTracker } from 'react-komposer'
import DisplayProductLists from '../../components/productLists/ProductLists'
import ProductLists from '../../../api/productLists/productLists'
import { Loading } from '../../components/Loading'
import { Meteor } from 'meteor/meteor'
import constants from '../../../modules/constants'

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('productLists.list')
  if (subscription.ready()) {
    const productLists = ProductLists.find({}, {sort: { activeStartDateTime: constants.Sort.DESCENDING }}).fetch()
    onData(null, { productLists })
  }
}

export default composeWithTracker(composer, Loading)(DisplayProductLists)

import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import Veggies  from '../../api/veggies/veggies';
import VeggiesList from '../components/VeggiesList.js';
import Loading from '../components/Loading.js';
import ProductData from './veggiesData';

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('veggies.list');
  if (subscription.ready()) {
    const veggies = Veggies.find().fetch();
    onData(null, { veggies });
  }
}

const composerD = (params, onData) => {
      const veggies = ProductData;
      onData(null, { veggies });
}

export default composeWithTracker(composerD, Loading)(VeggiesList);

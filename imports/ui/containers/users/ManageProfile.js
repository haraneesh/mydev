import { composeWithTracker } from 'react-komposer'
import { Loading } from '../../components/Loading/Loading'
import { Meteor } from 'meteor/meteor'
import Signup from '../../pages/Signup'

const composer = (params, onData) => {

 //https://github.com/kadirahq/mantra/issues/30
  const currentUser = !!Meteor.user();
  const loggingIn = Meteor.loggingIn();
  onData(null, {currentUser, loggingIn,, history: params.history}); 
}

export default composeWithTracker(composer, Loading)(Signup)

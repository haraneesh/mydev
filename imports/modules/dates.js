import moment from 'moment';
import { dateSettings } from './settings';

export const monthDayYear = (timestamp) => moment(timestamp)
  .local()
  .format('MMMM Do, YYYY');

export const monthDayYearAtTime = (timestamp) => moment(timestamp)
  .local()
  .format('MMMM Do, YYYY [at] hh:mm a');

export const timeago = (timestamp) => moment(timestamp)
  .local()
  .fromNow();

export const add = (timestamp, amount, range) => moment(timestamp)
  .local()
  .add(amount, range)
  .format();

export const year = (timestamp) => moment(timestamp)
  .local()
  .format('YYYY');

export const iso = (timestamp) => moment(timestamp)
  .local()
  .format();

export const monthDayYearAtTimeFromEpoch = (utcSeconds) => {
  const d = new Date(0); // The 0 there is the key, which sets the date to the epoch
  d.setUTCSeconds(utcSeconds);
  return moment(d).local().format('hh:mm A [on] MMMM DD, YYYY');
};

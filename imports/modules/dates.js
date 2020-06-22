import moment from 'moment';

export const monthDayYear = timestamp =>
  moment(timestamp)
    .local()
    .format('MMMM Do, YYYY');

export const monthDayYearAtTime = timestamp =>
  moment(timestamp)
    .local()
    .format('MMMM Do, YYYY [at] hh:mm a');

export const timeago = timestamp =>
  moment(timestamp)
    .local()
    .fromNow();

export const add = (timestamp, amount, range) =>
  moment(timestamp)
    .local()
    .add(amount, range)
    .format();

export const year = timestamp =>
  moment(timestamp)
    .local()
    .format('YYYY');

export const iso = timestamp =>
  moment(timestamp)
    .local()
    .format();

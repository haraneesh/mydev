// import { HTTP } from 'meteor/http';
import { fetch } from 'meteor/fetch';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import Settings from '../Settings/methods';

const MINUTES20 = 1200;

const ACCTOKEN = 'AccessToken';

function removeToken() {
  Settings.setValue(ACCTOKEN, '');
}

async function fetchLastToken() {
  return await Settings.getValue(ACCTOKEN);
}

async function getToken() {
  const tokenObject = await fetchLastToken();

  if (
    tokenObject &&
    tokenObject.access_token &&
    tokenObject.expireDate &&
    tokenObject.expireDate > Date.now()
  ) {
    return tokenObject.access_token;
  }

  const data = await generateToken();
  if (data.access_token) {
    Settings.setValue(ACCTOKEN, {
      access_token: data.access_token,
      expireDate: moment(Date.now())
        .add(data.expires_in - MINUTES20, 's')
        .toDate(),
    });

    return data.access_token;
  }

  return '';
}

async function generateToken() {
  const { clientId, clientSecret, refreshToken } = Meteor.settings.private.zoho;

  const params = {
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  };

  const response = await fetch(
    'https://accounts.zoho.com/oauth/v2/token?' + new URLSearchParams(params),
    {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: { 'Content-Type': 'application/json' },
    },
  );

  if (!response.ok) {
    console.log('---------------Error---------------------');
    console.log(response);
    throw new Error('Return response has an error');
  }
  const authReq = await response.json();

  if (authReq && authReq.access_token) {
    return authReq;
  }

  // error
  console.log(`error ${JSON.stringify(authReq)}`);
  return { access_token: '' };
}

const ZohoAuthentication = {
  getToken,
  removeToken,
  fetchLastToken,
  generateToken,
};

export default ZohoAuthentication;

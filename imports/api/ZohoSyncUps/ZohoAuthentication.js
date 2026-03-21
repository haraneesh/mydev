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
  if (data.access_token && data.access_token != '') {
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
  const zohoCfg = (Meteor.settings && Meteor.settings.private && Meteor.settings.private.zoho) || {};
  const { clientId, clientSecret, refreshToken } = zohoCfg;
  const accountsBaseUrl = zohoCfg.accountsBaseUrl || 'https://accounts.zoho.com';

  // Validate required settings
  if (!clientId || !clientSecret || !refreshToken) {
    console.log('Zoho OAuth config missing: ', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRefreshToken: !!refreshToken,
    });
    return { access_token: '' };
  }

  const params = {
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  };

  try {
    const url = `${accountsBaseUrl.replace(/\/$/, '')}/oauth/v2/token?${new URLSearchParams(params)}`;
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000), // 10 seconds
    });

    let bodyText = '';
    try {
      bodyText = await response.text();
    } catch (e) {
      bodyText = '';
    }

    if (!response.ok) {
      // Log response to aid debugging (invalid_client, invalid_grant, region issues, etc.)
      console.log('Zoho token response not OK:', response.status, response.statusText, bodyText);
      return { access_token: '' };
    }

    let authReq = {};
    try {
      authReq = bodyText ? JSON.parse(bodyText) : {};
    } catch (e) {
      console.log('Failed to parse Zoho token JSON:', e, bodyText);
      return { access_token: '' };
    }

    if (authReq && authReq.access_token) {
      return authReq;
    }

    console.log(`Zoho token error payload: ${JSON.stringify(authReq)}`);
  } catch (err) {
    console.log('Fetch failed:', err);
  }

  return { access_token: '' };
}

const ZohoAuthentication = {
  getToken,
  removeToken,
  fetchLastToken,
  generateToken,
};

export default ZohoAuthentication;

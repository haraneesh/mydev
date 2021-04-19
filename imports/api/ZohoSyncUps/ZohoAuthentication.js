import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import moment from 'moment';
import Settings from '../Settings/methods';

const MINUTES20 = 1200;

const ACCTOKEN = 'AccessToken';

class ZohoAuthentication {
  static removeToken() {
    Settings.setValue(ACCTOKEN, '');
  }

  static fetchLastToken() {
    return Settings.getValue(ACCTOKEN);
  }

  static getToken() {
    const tokenObject = this.fetchLastToken();

    if (tokenObject
      && tokenObject.access_token
      && tokenObject.expireDate
      && tokenObject.expireDate > Date.now()) {
      return tokenObject.access_token;
    }

    const data = this.generateToken();
    if (data.access_token) {
      Settings.setValue(ACCTOKEN, {
        access_token: data.access_token,
        expireDate: moment(Date.now()).add(data.expires_in - MINUTES20, 's').toDate(),
      });

      return data.access_token;
    }

    return '';
  }

  static generateToken() {
    const { clientId, clientSecret, refreshToken } = Meteor.settings.private.zoho;

    const authReq = HTTP.call(
      'POST',
      'https://accounts.zoho.com/oauth/v2/token',
      {
        params: {
          grant_type: 'refresh_token',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
        },
      },
    );

    if (authReq && authReq.data && authReq.data.access_token) {
      return authReq.data;
    }

    // error
    console.log(`error ${JSON.stringify(authReq)}`);
    return { access_token: '' };
  }
}

export default ZohoAuthentication;

// https://porter-logistics.notion.site/Porter-API-Contract-f9633061e7da40188b549a5e5db76c3d
/*
URI : `/v1/get_quote`

**Request Parameters Description:**

| Name | Type | Description |
| --- | --- | --- |
| pickup_details | json | REQUIRED - pickup latitude and longitude |
| pickup_details.lat | double | REQUIRED - latitude for pickup location, should be given upto at least 4 decimal places |
| pickup_details.lng | double | REQUIRED - longitude for pickup location,Should be given upto at least 4 decimal |
| drop_details | json | REQUIRED - drop latitude and longitude |
| drop_details.lat | double | REQUIRED - latitude for drop location, should be given upto at least 4 decimal places |
| drop_details.lng | double | REQUIRED - longitude for drop location,Should be given upto at least 4 decimal |
| customer | json | REQUIRED - customer name , customer number , country_code |
| customer.name  | string | REQUIRED - customer name |
| customer.mobile | json | REQUIRED - country_code ,phone number of customer |
| customer.mobile.country_code | string | REQUIRED - customer provide the country code as an string for ex = “+91” |
| customer.mobile.number | string | REQUIRED - phone number should be without country code |
| Token ( HEADER ) | String  | REQUIRED - token for authentication |

*/

/*
curl --location --request GET 'https://{porter_host}/v1/get_quote
' \
--header 'X-API-KEY: O8AJTXXXXXXXXXX-UA1LiA' \
--header 'Content-Type: application/json' \
--data-raw '{
    "pickup_details": {
        "lat" : 12.935025018880504,
    "lng" : 77.6092605236106
},
"drop_details": {
        "lat" : 12.947146336879577,
    "lng" : 77.62102993895199
},
"customer": {
       "name" : "salik",
    "mobile" : {
        "country_code" : "+91",
        "number" : "7678139714"
}
}
   }'
*/

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import rateLimit from '../../modules/rate-limit';
import { Orders } from '../Orders/Orders';
import { PorterOrder } from './PorterOrder';
import handleMethodException from '../../modules/handle-method-exception';
import porter from './PorterApi.js';
import constants from '/imports/modules/constants';

const getQuoteFromPorter = (orderId) => {
  const order = Orders.findOne({ _id: orderId });
  const u = Meteor.users.findOne({ username: order.customer_details.mobilePhone.toString() });
  const porterParams = {
    pickup_details: {
      lat: Meteor.settings.public.suvaiLocation.latitude,
      lng: Meteor.settings.public.suvaiLocation.longitude,
    },
    drop_details: {
      lat: u.profile.deliveryAddressLatitude,
      lng: u.profile.deliveryAddressLongitude,
    },
    customer: {
      name: `${u.profile.name.first} ${u.profile.name.last}`,
      mobile: {
        country_code: '+91',
        number: order.customer_details.mobilePhone,
      },
    },
  };

  const r = porter.postRecordsByParams('/v1/get_quote', porterParams);
  return r;
};

function updatePorterOrderStatus(orderId, status) {
  Orders.update({ _id: orderId }, { $set: { porterOrderStatus: status } });
  PorterOrder.update({ orderId }, { $set: { orderStatus: status } });
}

Meteor.methods({
  'porter.getQuote': function getQuote(orderId) {
    check(orderId, String);
    if (Meteor.isServer) {
      try {
        const result = getQuoteFromPorter(orderId);
        return result;
      } catch (exception) {
        handleMethodException(exception);
      }
    } else {
      throw new Meteor.Error(403, 'Access Denied');
    }
  },
  'porter.cancelOrder': function cancelOrder(orderId) {
    check(orderId, String);
    if (Meteor.isServer) {
      try {
        const porterOrder = PorterOrder.findOne({ orderId });
        const result = porter.postRecordsByParams(`/v1/orders/${porterOrder.porterOrderId}/cancel`);
        updatePorterOrderStatus(orderId, constants.PorterStatus.cancelled.name);
        return result;
      } catch (exception) {
        console.log('---- porter order Id -----');
        console.log(exception);
        console.log('------------------');
        handleMethodException(exception);
      }
    }
  },
  'porter.getStatus': function getStatus(orderId) {
    check(orderId, String);
    if (Meteor.isServer) {
      try {
        const porterOrder = PorterOrder.findOne({ orderId });
        // const result = getStatusFromPorter(porterOrder.porterOrderId);
        const result = porter.getRecordById('v1.1/orders', porterOrder.porterOrderId);
        return result;
      } catch (exception) {
        handleMethodException(exception);
      }
    } else {
      throw new Meteor.Error(403, 'Access Denied');
    }
  },
  'porter.createOrder': function createOrder(orderId) {
    check(orderId, String);
    if (Meteor.isServer) {
      try {
        const porterOrder = PorterOrder.findOne({ orderId });
        if (porterOrder && porterOrder.orderStatus !== 'cancelled') {
          throw new Meteor.Error('403', 'A Porter Order is live for this order');
        }
        const order = Orders.findOne({ _id: orderId });
        const u = Meteor.users.findOne({ username: order.customer_details.mobilePhone.toString() });

        const dropAddress = u.profile.deliveryAddress.trim();

        const firstSpaceIndex = dropAddress.indexOf(' ');
        const doorNumber = dropAddress.substring(0, firstSpaceIndex);

        const buildParams = {
          request_id: `Suvai Organics_order_${orderId}`,
          delivery_instructions: {
            instructions_list: [
              {
                type: 'text',
                description: 'handle with care',
              },
              {
                type: 'text',
                description: 'Test order 52',
              },
            ],
          },
          drop_details: {
            address: {
              apartment_address: doorNumber,
              street_address1: dropAddress,
              street_address2: '',
              landmark: '',
              city: 'Chennai',
              state: 'Tamilnadu',
              pincode: u.profile.deliveryPincode,
              country: 'India',
              lat: u.profile.deliveryAddressLatitude,
              lng: u.profile.deliveryAddressLongitude,
              contact_details: {
                name: `${u.profile.salutation} ${u.profile.name.first} ${u.profile.name.last}`,
                phone_number: u.profile.whMobilePhone.replace('+91', '').trim(),
                // api throws an error when the number has +91
              },
            },
          },
          pickup_details: {
            address: {
              apartment_address: '59, Ground Floor',
              street_address1: 'Kuringi Street',
              street_address2: 'Fathima Nagar',
              landmark: 'La Mech School',
              city: 'Chennai',
              state: 'Tamilnadu',
              pincode: '600087',
              country: 'India',
              lat: Meteor.settings.public.suvaiLocation.latitude,
              lng: Meteor.settings.public.suvaiLocation.longitude,
              contact_details: {
                name: 'Suvai Manager',
                phone_number: Meteor.settings.public.Support_Numbers.whatsapp.replace('+91', '').trim(),
                // api throws an error when the number has +91
              },
            },
          },
        };

        const result = porter.postRecordsByParams('/v1/orders/create', buildParams);

        // if success
        const porterResponse = {
          requestId: result.request_id,
          porterOrderId: result.order_id,
          estimatedFare: result.estimated_fare_details.minor_amount,
          estimatedPickUpTime: result.estimated_pickup_time,
          trackingUrl: result.tracking_url,
          orderStatus: constants.PorterStatus.live.name,
        };

        PorterOrder.upsert({
          orderId,
        }, { $set: porterResponse });

        Orders.update(
          { _id: orderId },
          { $set: { porterOrderStatus: constants.PorterStatus.live.name } },
        );

        return result;
      } catch (exception) {
        handleMethodException(exception);
      }
    }
  },
});

rateLimit({
  methods: [
    'porter.getQuote',
    'porter.createOrder',
    'porter.getOrderDetails',
    'porter.cancelOrder',
    'porter.getStatus',
  ],
  limit: 5,
  timeRange: 1000,
});

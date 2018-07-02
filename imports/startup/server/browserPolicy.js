import { BrowserPolicy } from 'meteor/browser-policy-common';

BrowserPolicy.content.allowFontDataUrl();
BrowserPolicy.content.allowOriginForAll('cdnjs.cloudflare.com');
BrowserPolicy.content.allowOriginForAll('fonts.googleapis.com');
BrowserPolicy.content.allowOriginForAll('fonts.gstatic.com');
// BrowserPolicy.content.allowOriginForAll("allfont.net");
// Razor Pay
BrowserPolicy.content.allowOriginForAll('checkout.razorpay.com');
BrowserPolicy.content.allowOriginForAll('api.razorpay.com');
// Google Storage
BrowserPolicy.content.allowOriginForAll('storage.googleapis.com');
// Analytics
BrowserPolicy.content.allowOriginForAll('www.google-analytics.com');
BrowserPolicy.content.allowOriginForAll('cdn.mxpnl.com');
BrowserPolicy.content.allowOriginForAll('cdn.segment.com');
BrowserPolicy.content.allowOriginForAll('inventory.zoho.com');
// Bootstrap for reports
BrowserPolicy.content.allowOriginForAll('https://maxcdn.bootstrapcdn.com/');
// Flickr url support
// BrowserPolicy.content.allowOriginForAll("c1.staticflickr.com");
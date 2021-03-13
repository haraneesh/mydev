import { BrowserPolicy } from 'meteor/browser-policy-common';

BrowserPolicy.content.allowFontDataUrl();
BrowserPolicy.content.allowOriginForAll('cdnjs.cloudflare.com');
BrowserPolicy.content.allowOriginForAll('fonts.googleapis.com');
BrowserPolicy.content.allowOriginForAll('fonts.gstatic.com');
BrowserPolicy.content.allowOriginForAll('www.gstatic.com');
BrowserPolicy.content.allowOriginForAll('netdna.bootstrapcdn.com');
BrowserPolicy.content.allowOriginForAll('use.fontawesome.com');
// BrowserPolicy.content.allowOriginForAll("allfont.net");
// Google Maps
BrowserPolicy.content.allowOriginForAll('www.google.com');
// Razor Pay
BrowserPolicy.content.allowOriginForAll('checkout.razorpay.com');
BrowserPolicy.content.allowOriginForAll('api.razorpay.com');
// Storage
BrowserPolicy.content.allowOriginForAll('storage.googleapis.com');
BrowserPolicy.content.allowOriginForAll('res.cloudinary.com');
// Analytics
BrowserPolicy.content.allowOriginForAll('www.google-analytics.com');
BrowserPolicy.content.allowOriginForAll('cdn.mxpnl.com');
BrowserPolicy.content.allowOriginForAll('cdn.segment.com');
BrowserPolicy.content.allowOriginForAll('api.segment.io');
BrowserPolicy.content.allowOriginForAll('inventory.zoho.com');
// Bootstrap for reports
BrowserPolicy.content.allowOriginForAll('https://maxcdn.bootstrapcdn.com/');
BrowserPolicy.content.allowOriginForAll('player.vimeo.com');
BrowserPolicy.content.allowOriginForAll('www.youtube.com');

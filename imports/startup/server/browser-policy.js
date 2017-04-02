import { BrowserPolicy } from 'meteor/browser-policy-common';
// e.g., BrowserPolicy.content.allowOriginForAll( 's3.amazonaws.com' );

BrowserPolicy.content.allowFontDataUrl();
BrowserPolicy.content.allowOriginForAll("cdnjs.cloudflare.com");
BrowserPolicy.content.allowOriginForAll("fonts.googleapis.com");
BrowserPolicy.content.allowOriginForAll("fonts.gstatic.com");
//BrowserPolicy.content.allowOriginForAll("allfont.net");
//AWS Bucket
BrowserPolicy.content.allowOriginForAll("suvai-aws-bucket.s3.amazonaws.com");
// Flickr url support
BrowserPolicy.content.allowOriginForAll("c1.staticflickr.com");



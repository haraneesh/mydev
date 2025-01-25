//** control browser security policy
import {BrowserPolicy} from "meteor/browser-policy-common";
BrowserPolicy.content.allowInlineScripts();
BrowserPolicy.content.allowFontOrigin("data:");

const allowedOrigins = Meteor.settings.private.allowedOrigins;

for (const origin of allowedOrigins) {
    BrowserPolicy.content.allowOriginForAll( origin );
}


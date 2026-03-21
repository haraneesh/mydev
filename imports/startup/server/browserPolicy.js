//** control browser security policy
import {BrowserPolicy} from "meteor/browser-policy-common";

// Allow inline scripts and data URLs for fonts
BrowserPolicy.content.allowInlineScripts();
BrowserPolicy.content.allowFontOrigin("data:");

// Allow common origins for development
const defaultOrigins = [
    "http://localhost:3000",
    "https://localhost:3000", 
    "http://127.0.0.1:3000",
    "https://127.0.0.1:3000",
    "ws://localhost:3000",
    "wss://localhost:3000"
];

// Get allowed origins from settings or use defaults
const allowedOrigins = Meteor.settings?.private?.allowedOrigins || defaultOrigins;

for (const origin of allowedOrigins) {
    BrowserPolicy.content.allowOriginForAll(origin);
}

// Allow eval for Meteor's hot code replacement in development
if (process.env.NODE_ENV !== 'production') {
    BrowserPolicy.content.allowEval();
}


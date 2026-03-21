import { Meteor } from 'meteor/meteor';
import { Cloudinary } from 'meteor/socialize:cloudinary';

Cloudinary.config({
  cloud_name: Meteor.settings.public.cloudinary.cloudName,
  api_key: Meteor.settings.public.cloudinary.apiKey,
});

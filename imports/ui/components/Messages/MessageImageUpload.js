import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Cloudinary } from 'meteor/socialize:cloudinary';
import { Image, Placeholder, Transformation } from 'cloudinary-react';

const config = {
  options: {
    tags: 'message',
    folder: 'messages',
    overwrite: true, // only 1 image per message
  },
};
const uploadImage = async ({ imageData, imageId }) => {
  const cnf = { ...config };
  cnf.options.public_id = imageId;
  const val = await Cloudinary.uploadFile(imageData, cnf);
  const { public_id } = val;
  return public_id;
};

export const MessageImageViewHero = ({ cloudImageId }) => (
  <Image
    secure="true"
    loading="lazy"
    cloudName={Meteor.settings.public.cloudinary.cloudName}
    publicId={cloudImageId}
    crop="scale"
    style={{
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'block',
      maxWidth: '100%',
      borderRadius: '10px',
      marginBottom: '5px',
      minHeight: '17.5em',
    }}
  >
    <Transformation quality="auto:best" fetchFormat="auto" />
    <Transformation flags="progressive.progressive:semi" />
  </Image>
);

export const MessageImageViewHeroExpand = ({ cloudImageId }) => (
  <Image
    secure="true"
    loading="lazy"
    cloudName={Meteor.settings.public.cloudinary.cloudName}
    publicId={cloudImageId}
    crop="scale"
    style={{
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'block',
      borderRadius: '10px',
      marginBottom: '5px',
      minHeight: '100%',
    }}
  >
    <Transformation quality="auto:best" fetchFormat="auto" />
    <Transformation flags="progressive.progressive:semi" />
  </Image>
);

export const deleteImage = async (imageId) => Cloudinary.delete(imageId);

export default uploadImage;

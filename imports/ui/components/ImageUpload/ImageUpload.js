import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { useDropzone } from 'react-dropzone';
import { Cloudinary } from 'meteor/socialize:cloudinary';

import { Image, Placeholder, Transformation } from 'cloudinary-react';

const ImageField = ({
  onChange, folder, imageId, allowedFormats, overwrite, format,
}) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    multiple: false,
    noDrag: true,
    onDrop: (acceptedFiles) => {
      /* setFiles(
        acceptedFiles.map(file => Object.assign(file, {
          preview: URL.createObjectURL(file),
        })),
      ); */
      const reader = new FileReader();
      reader.readAsDataURL(acceptedFiles[0]);
      reader.onload = () => {
        if (reader.result) {
          const config = {
            options: {
              folder,
              public_id: imageId,
              overwrite, // only 1 image per recipe
              format,
              allowed_formats: allowedFormats,
            },
          };
          const image = Cloudinary.uploadFile(reader.result, config);
          image.then((val) => {
            const { public_id } = val;
            const url = Cloudinary.url(public_id,
              { quality: 'auto:best', flags: 'progressive.progressive:semi', format: val.format }).replace('http://', 'https://');
            const urlArr = public_id.split('/');
            onChange({
              imageUrl: url,
              thumbNailUrl: url,
              imageId: urlArr[urlArr.length - 1],
            });
          });
        }
      };
    },
  });

  return (
    <div className="field form-group">
      <div
        {...getRootProps({ className: 'dropzone form-control' })}
        style={{ height: '4em', border: '2px dashed' }}
      >
        <input {...getInputProps()} />
        <p>Click here or Drag 'n' drop image file</p>
      </div>
    </div>
  );
};

ImageField.defaultProps = {
  imageId: null,
  overwrite: true,
  allowedFormats: 'jpg, jpeg, png',
  format: 'jpg',
};

ImageField.propTypes = {
  onChange: PropTypes.func.isRequired,
  folder: PropTypes.string.isRequired,
  imageId: PropTypes.string,
  overwrite: PropTypes.boolean,
  allowedFormats: PropTypes.string,
  format: PropTypes.string,
};

export default ImageField;

export const RecipeImageViewThumbnail = ({ cloudImageId }) => (
  <Image
    secure="true"
    loading="lazy"
    cloudName={Meteor.settings.public.cloudinary.cloudName}
    publicId={`recipes/${cloudImageId}`}
    height="200"
    crop="scale"
    style={{ marginLeft: 'auto', marginRight: 'auto', display: 'block' }}
  >
    <Placeholder type="predominant" />
    <Transformation quality="auto" fetchFormat="auto" />
  </Image>
);

export const RecipeImageViewHero = ({ cloudImageId }) => (
  <Image
    secure="true"
    loading="lazy"
    cloudName={Meteor.settings.public.cloudinary.cloudName}
    publicId={`recipes/${cloudImageId}`}
    crop="scale"
    style={{
      marginLeft: 'auto', marginRight: 'auto', display: 'block', maxWidth: '100%',
    }}
  >
    <Placeholder type="predominant" />
    <Transformation quality="auto:best" fetchFormat="auto" />
    <Transformation flags="progressive.progressive:semi" />
  </Image>
);

export const RecipeCategoryImage = ({ cloudImageId }) => (
  <Image
    secure="true"
    loading="lazy"
    cloudName={Meteor.settings.public.cloudinary.cloudName}
    publicId={`recipes/${cloudImageId}`}
    crop="scale"
    style={{
      marginLeft: 'auto', marginRight: 'auto', display: 'block', maxWidth: '100%',
    }}
  >
    <Placeholder type="predominant" />
    <Transformation quality="auto:best" fetchFormat="auto" />
    <Transformation flags="progressive.progressive:semi" />
  </Image>
);

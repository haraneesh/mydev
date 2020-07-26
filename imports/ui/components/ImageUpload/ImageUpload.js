import React from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { Cloudinary } from 'meteor/socialize:cloudinary';

const ImageField = ({ onChange, folder, imageId, allowedFormats, overwrite, format }) => {
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
          const config = { options: {
            folder,
            public_id: imageId,
            overwrite, // only 1 image per recipe
            format,
            allowed_formats: allowedFormats,
            // transformation:['fl_progressive.progressive:semi', 'q_auto:best', 't_media_lib_thumb'],
          } };
          const image = Cloudinary.uploadFile(reader.result, config);
          image.then((val) => {
            const { public_id } = val;
            const url = Cloudinary.url(public_id,
              { quality: 'auto:best', flags: 'progressive.progressive:semi', format: val.format },
            ).replace('http://', 'https://');
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

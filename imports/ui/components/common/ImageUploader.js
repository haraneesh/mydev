import React from 'react';
import PropTypes from 'prop-types';
import { Bert } from 'meteor/themeteorchef:bert';
import { Button, FormControl } from 'react-bootstrap';
import constants from '../../../modules/constants';
import { removeRecipePhoto, updateRecipePhoto } from '../../../api/recipes/methods';
import Media from '../../../api/media/media';

export default class ImageUploader extends React.Component {
  constructor(props, context) {
    super(props, context);
    const url = props.imageUrl;
    this.state = {
      state: url ? 'complete' : 'upload',
      url,
      uploadMSG: '',
    };

    this._updateState = this._updateState.bind(this);
    this._changePhoto = this._changePhoto.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.imageUrl !== this.props.imageUrl) {
      this.setState({
        state: (nextProps.imageUrl) ? 'complete' : 'upload',
        url: nextProps.imageUrl,
      });

      if (nextProps.imageUrl) {
        this.props.updateImageUrl(nextProps.imageUrl);
      }
    }
  }

  _updateState(state, url, displayMessage) {
    this.setState({
      url,
      state,
      uploadMSG: displayMessage,
    });
  }

  _fileUpload(event) {
    const fsFile = new FS.File(event.target.files[0]);
    fsFile.owner = Meteor.userId();
    fsFile.postType = constants.PostTypes.Recipe.name;
    fsFile.recipeId = this.props.id;

    Media.insert(fsFile, (err, fileObj) => {
      if (err) {
        Bert.alert(err.message, 'danger');
      } else {
        // Inserted record in to Media. But wait for the upload to complete
      }
    });
  }

  _changePhoto(event, id) {
    event.preventDefault();
    if (confirm('Are you sure, you want to delete this image and add a new one? Deletion is permanent.')) {
      removeRecipePhoto.call({ recipeId: id }, (error, msg) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        }
      });
    }
  }

  render() {
    _state = this.state;
    _prop = this.props;
    const recipeImage = _state.url ? { backgroundImage: `url('${_state.url}')` } : '';

    switch (_state.state) {
      case 'complete':
        return (
          <div className="view-recipe-image" style={recipeImage}>
            <Button
              bsSize="small"
              onClick={event =>
                this._changePhoto(event, _prop.id)}
            >
              Change Photo
            </Button>
          </div>
        );

      case 'uploading':
        return (
          <div id="image-section">
            <label className="alert alert-info btn-file">
              <span id="upload-message">{_state.uploadMSG}</span>
            </label>
          </div>
        );

      default:
        return (
          <div id="image-section">
            <div id="upload" className="upload-area">
              <label className="alert alert-info btn-file">
                <span id="upload-message">
                  "Click to upload a recipe image or drop it here"
                </span>
                <FormControl
                  type="file"
                  onChange={event => this._fileUpload(event)}
                />
              </label>
            </div>
          </div>
        );
    }
  }
}

ImageUploader.propTypes = {
  updateImageUrl: PropTypes.func.isRequired,
  imageUrl: PropTypes.string,
  id: PropTypes.string.isRequired,
};

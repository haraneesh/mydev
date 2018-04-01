import { Meteor } from 'meteor/meteor';
import constants from '../../modules/constants';
import { updateRecipePhoto } from '../Recipes/methods';
// FS.debug = true;

let mediaStoreOriginals;
let mediaStoreThumbnails;
let Media;

if (Meteor.isServer) {
  mediaStoreOriginals = new FS.Store.FileSystem(constants.MediaStores.Originals.name, {
    path: `app-files/${constants.MediaStores.Originals.name}`, //optional, default is "/cfs/files" path within app container
  });

  mediaStoreThumbnails = new FS.Store.FileSystem(constants.MediaStores.Thumbnails.name, {
    path: `app-files/${constants.MediaStores.Thumbnails.name}`, // optional, default is "/cfs/files" path within app container

    beforeWrite(fileObj) {
      fileObj.size(20, { store: constants.MediaStores.Thumbnails.name, save: false });
    },
    transformWrite(fileObj, readStream, writeStream) {
      gm(readStream, fileObj.name())
        .resize('250', '250')
        .stream()
        .pipe(writeStream);
    },
  });

  Media = new FS.Collection('media', {
    stores: [mediaStoreOriginals, mediaStoreThumbnails],
    filter: {
      allow: {
        contentTypes: ['image/*'],
      },
    },
  });

  Media.on('stored', Meteor.bindEnvironment((fileObj, storename) => {
    if (storename === constants.MediaStores.Originals.name) {
      updateRecipePhoto(fileObj._id, fileObj.recipeId);
    }
  }));
}

if (Meteor.isClient) {
  mediaStoreOriginals = new FS.Store.FileSystem(constants.MediaStores.Originals.name);
  mediaStoreThumbnails = new FS.Store.FileSystem(constants.MediaStores.Thumbnails.name);

  Media = new FS.Collection('media', {
  // stores: [mediaStoreSmall, mediaStoreLarge],
    stores: [mediaStoreOriginals, mediaStoreThumbnails],
    filter: {
      allow: {
        contentTypes: ['image/*'],
      },
    },
  });
}

Media.allow({
  insert(userId) {
    return userId != null;
  },
  update(userId, image) {
    return userId === image.userId || Roles.userIsInRole(userId, ['admin']);
  },
  remove(userId, image) {
    return userId === image.userId || Roles.userIsInRole(userId, ['admin']);
  },
  download() {
    return true;
  },
});

Media.deny({
  insert: () => false,
  update: () => true,
  remove: () => true,
  download: () => false,
});

export default Media;

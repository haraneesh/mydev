import { Meteor } from 'meteor/meteor';
import constants from '../../modules/constants';
import { updateRecipePhoto } from '../Recipes/methods';
/*
let mediaStoreLarge = new FS.Store.S3("mediaLarge", {
  accessKeyId: Meteor.settings.private.AWSAccessKeyId,
  secretAccessKey: Meteor.settings.private.AWSSecretAccessKey,
  // bucket: "media.large",
  bucket: Meteor.settings.private.aws_bucket,
  transformWrite(fileObj, readStream, writeStream) {
    gm(readStream, fileObj.name()).resize('250', '250').stream().pipe(writeStream)
  }
});

let mediaStoreSmall = new FS.Store.S3("mediaSmall", {
  accessKeyId: Meteor.settings.private.AWSAccessKeyId,
  secretAccessKey: Meteor.settings.private.AWSSecretAccessKey,
  // bucket: "media.small",
  bucket: Meteor.settings.private.aws_bucket,
  beforeWrite(fileObj) {
    fileObj.size(20, {store: "mediaStoreSmall", save: false});
  },
  transformWrite(fileObj, readStream, writeStream) {
    gm(readStream, fileObj.name()).resize('20', '20').stream().pipe(writeStream)
  }
});
*/
// FS.debug = true;

/* const mediaStoreThumbnail = new FS.Store.FileSystem(
  constants.MediaStores.Thumbnails.name,
  {
    maxTries: 5, // optional, default 5
    transformWrite(fileObj, readStream, writeStream) {
      const width = constants.MediaStores.Thumbnails.width;
      const height = constants.MediaStores.Thumbnails.height;
      gm(readStream, fileObj.name())
        .resize(width, height)
        .stream()
        .pipe(writeStream);
    },
  }
);

const mediaStoreOriginal = new FS.Store.FileSystem(
  constants.MediaStores.Originals.name,
  {
    maxTries: 5, // optional, default 5
  }
);*/

let mediaStoreOriginals;
let mediaStoreThumbnails;
let Media;

if (Meteor.isServer) {
  mediaStoreOriginals = new FS.Store.S3(
   constants.MediaStores.Originals.name,
    {
      accessKeyId: Meteor.settings.AWSAccessKeyId,
      secretAccessKey: Meteor.settings.AWSSecretAccessKey,
      // bucket: 'media.large',
      bucket: Meteor.settings.private.aws_bucket_originals,
    });

  mediaStoreThumbnails = new FS.Store.S3(
  constants.MediaStores.Thumbnails.name,
    {
      accessKeyId: Meteor.settings.AWSAccessKeyId,
      secretAccessKey: Meteor.settings.AWSSecretAccessKey,
       // bucket: 'media.large',
      bucket: Meteor.settings.private.aws_bucket_thumbnails,
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
  mediaStoreOriginals = new FS.Store.S3(constants.MediaStores.Originals.name);
  mediaStoreThumbnails = new FS.Store.S3(constants.MediaStores.Thumbnails.name);

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

function RemoveSpaces(fileName){
  let sanitizedURL = fileName.replace(/\s+/g, '-')
  return sanitizedURL
}

Slingshot.fileRestrictions( "uploadToAmazonS3", {
  allowedFileTypes: [ "image/png", "image/jpeg", "image/gif" ],
  maxSize: 1 * 1024 * 1024
});

Slingshot.createDirective( "uploadToAmazonS3", Slingshot.S3Storage, {
  bucket: Meteor.settings.private.aws_bucket,
  acl: "public-read",
  authorize: function (file, meta) {
    // meta.Id has imageNameOnServer 
    //Deny uploads if user is not logged in.
    if (!this.userId) {
        var message = "Please login before posting files";
        throw new Meteor.Error("Login Required", message);
    }
    return true;
  },
  key: function ( file, meta ) {
    //var user = Meteor.users.findOne( this.userId );
    //var timeStamp = Math.floor(Date.now());
    //console.log("Sanitized URL " +  RemoveSpaces(file.name) )
    return meta.args.imageType + "/" + meta.args.imageNameOnServer + "-" + RemoveSpaces(file.name);
  }
});
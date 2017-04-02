const publicS3URI = (string) => {
	return encodeURIComponent(string)
		.replace(/%20/img, '+')
		.replace(/%2F/img, '/')
        .replace(/\"/img, "%22")
        .replace(/\#/img, "%23")
        .replace(/\$/img, "%24")
        .replace(/\&/img, "%26")
        .replace(/\'/img, "%27")
            .replace(/\(/img, "%28")
        .replace(/\)/img, "%29")
        .replace(/\,/img, "%2C")
        .replace(/\:/img, "%3A")
        .replace(/\;/img, "%3B")
        .replace(/\=/img, "%3D")
        .replace(/\?/img, "%3F")
        .replace(/\@/img, "%40");
}

Slingshot.fileRestrictions( "uploadToAmazonS3", {
  allowedFileTypes: [ "image/png", "image/jpeg", "image/gif" ],
  maxSize: 1 * 1024 * 1024
});

Slingshot.createDirective( "uploadToAmazonS3", Slingshot.S3Storage, {
  bucket: Meteor.settings.private.aws_bucket,
  acl: "public-read",
  authorize: function (file, meta) {
    // meta.Id has the recipe Id  
    //Deny uploads if user is not logged in.
    if (!this.userId) {
        var message = "Please login before posting files";
        throw new Meteor.Error("Login Required", message);
    }
    return true;
  },
  key: function ( file, meta ) {
    //var user = Meteor.users.findOne( this.userId );
    var timeStamp = Math.floor(Date.now());
    return  meta.recipeId + "/" + timeStamp + "/" + publicS3URI(file.name);
  }
});
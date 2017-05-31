import AWS from 'aws-sdk'

export function AWSRemoveFile(url){
    let key = url.substring(url.lastIndexOf('.com') + 5) 

    var s3 = new AWS.S3({
        accessKeyId: Meteor.settings.AWSAccessKeyId, /* Meteor.settings.AWSAccessKeyId pull from Meteor.settings */ 
        secretAccessKey: Meteor.settings.AWSSecretAccessKey,/* pull from Meteor.settings */
        params: {
                Bucket: Meteor.settings.private.aws_bucket, 
                Key: key          
        } 
    });
    /*
    s3.deleteObject({
            Bucket: Meteor.settings.private.aws_bucket, 
        Key: fileName
    })*/
    //let key = url.substring(url.lastIndexOf('.com') + 5) 
    //let key = url.substring(url.lastIndexOf('/') + 1) 
    /*var params = {
        Bucket: Meteor.settings.private.aws_bucket, 
        Key: key          
    } */

    return s3
}    
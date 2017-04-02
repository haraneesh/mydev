import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import rateLimit from '../../modules/rate-limit'
import constants from '../../modules/constants'
import Invitations from './invitations'
import { Random } from 'meteor/random'
import { Meteor } from 'meteor/meteor'

export const sendInvitation = new ValidatedMethod({
  name: 'invitations.send',
  validate: new SimpleSchema({
    name: { type:String },
    email:{ type: String, regEx: SimpleSchema.RegEx.Email }
  }).validator(),
  run(invitation) {

      invitation.sentUserId = this.userId
      invitation.token = Random.hexString( 16 )
      invitation.role = "member"
      invitation.receivedUserId = ""
      invitation.invitation_status = constants.InvitationStatus.Sent.name

      /* let query
        switch (true){
          case (Roles.userIsInRole(loggedInUserId, ['admin']) || !(invitation._id)):
             query = { _id: invitation._id }
             break;
          default:
             query = { and:[
               { _id: invitation._id },
               { sentUserId :loggedInUserId }
             ]}   
             break;
      }*/
     
      if (Meteor.isServer) {
         let user = Meteor.users.findOne( this.userId );
        let fromName = user.profile.name;
        let email = _prepareEmail( invitation.token, name, fromName );
        _sendInvitation( invitation.email, email, fromName );
      }
      return Invitations.insert(invitation);
  },
});

let _prepareEmail = ( token, name, fromName ) => {
  debugger;
  let domain = Meteor.settings.private.domain;
  let url    = `http://${ domain }/invitations/${ token }`;

  SSR.compileTemplate( 'invitation', Assets.getText( 'email/templates/invitation.html' ) );
  let html = SSR.render( 'invitation', { url: url, nameOfInvited:name, nameOfInvitee:fromName } );

  return html;
};

let _sendInvitation = ( email, content, fromName ) => {
  fromEmailId = Meteor.settings.private.fromEmailId;
  Email.send({
    to: email,
    from: `Suvai ${ Meteor.settings.private.fromInvitationEmail }`,
    subject: `${fromName.first} ${fromName.last} has Invited you to Suvai Community`,
    html: content
  });
}

export const removeInvitation = new ValidatedMethod({
  name: 'invitations.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  run({ invitationId }) {
      let query
      switch (true){
          case Roles.userIsInRole(this.userId, ['admin']): 
                query = { _id:invitationId } 
                break;      
          default:
                query = { and: [
                            { _id:invitationId },
                            { sentUserId: this.userId },
                          ]
                        }
                break;      
    }
    Invitations.remove (query, { justOne:true })
  }
});

rateLimit({
  methods: [
    sendInvitation,
    removeInvitation,
  ],
  limit: 5,
  timeRange: 1000,
});
import React from 'react';
import { Button, FormGroup, ControlLabel, FormControl, Panel, Image } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert'
import constants from '../../../modules/constants'

export default class ImageUploader extends React.Component {
  constructor (props, context){
      super(props, context)
      const url = props.recipe && props.recipe.imageUrl
      this.state = {
          state:(url)? "complete":"upload",
          url:url,
          uploadMSG:""
      }
      this.props.updateImageUrl(url)
      this._updateState = this._updateState.bind(this)
  }

  _updateState(state, url, displayMessage){ 
    this.setState ({
        url:url,
        state:state,
        uploadMSG:displayMessage
    })
    
    this.props.updateImageUrl(url)
  }

  _uploadFileToAmazon ( file, recipeId ) {
        debugger;
        const uploader = new Slingshot.Upload( "uploadToAmazonS3",{ recipeId:recipeId });
        this._updateState("uploading", "", `Uploading ${file.name}...`)
        uploader.send( file, ( error, url ) => {
            if ( error ) {
                Bert.alert( error.message, "danger" );
            } else {
                this._updateState("complete", url, "")
            }
        });
    };

    _getFileFromInput( event ) {
        return event.target.files[0];
    }
        //document.getElementById("upload-message").innerHTML = message

    _fileUpload(event, recipeId){
        //alert('here')
        let file = this._getFileFromInput( event );
        this._uploadFileToAmazon( file, recipeId );
    }

  render(){
      _state = this.state
      _prop = this.props
       const recipeImage = (_state.url)? {backgroundImage: "url('" + _state.url + "')"} : ""

      switch(_state.state){
          case "complete":
            //return( <Image src= { _state.url } responsive /> )
            return ( 
                    <div className ="view-recipe-image" style = { recipeImage } >
                        <Button bsSize="small">Change Photo</Button>
                    </div>
                )
            break;
          case "uploading":
            return ( 
                     <div id = "image-section">  
                        <label className="alert alert-info btn-file"> 
                        <span id="upload-message">{ _state.uploadMSG }</span>
                        </label>
                     </div> 
                    )
            break;
          default:
            return(
                    <div id = "image-section">  
                        <form id="upload" className="upload-area">
                            <label className="alert alert-info btn-file"> 
                            <span id="upload-message">"Drag here or click here to upload recipe image"</span>
                            <FormControl type="file" onChange = {(event)=> this._fileUpload (event, _prop.recipe._id)}/>   
                            </label>
                        </form>
                    </div>
                 )
            break;  
      }
   }
}

ImageUploader.propTypes={
    recipe: React.PropTypes.object.isRequired,
    updateImageUrl: React.PropTypes.func.isRequired
}



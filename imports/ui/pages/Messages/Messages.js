import React from 'react';
import Row from 'react-bootstrap/Row'


const WhatsAppSupport = Meteor.settings.public.Support_Numbers.whatsapp;
const LandLineSupport = Meteor.settings.public.Support_Numbers.landline;

function Messages ({ history }) {

    const whatsAppsupportNumber = WhatsAppSupport.replace(' ', '').replace('+','' );
    return (     
        <div className="p-3 m-3 d-flex flex-column">
            <section className="w-75 m-auto">
                <div className="card">
                    <div className="card-body">
                    <h5 className="card-title h3 py-3">We are on Whatsapp</h5>
                        <p className="card-text">Whatsapp Number: {Meteor.settings.public.Support_Numbers.whatsapp}</p>
                        <a aria-label="Chat on WhatsApp" href={`https://wa.me/${whatsAppsupportNumber}`} target="_blank" >
                        <img alt="Chat on WhatsApp" src="WhatsAppButtonGreenMedium.svg" /> 
                        </a>
                    </div>
                </div>
                <Row><span className="text-center text-muted mt-5">   - - - - -   OR   - - - - -   </span></Row>
                <div className="card mt-3">
                    <div className="card-body">
                    <h5 className="card-title h3 py-3">Or Call Us</h5>
                        <p className="card-text">Landline Number: {LandLineSupport}</p>
                        <a aria-label="Call us" className="btn btn-primary" href={`tel:${LandLineSupport.replace(' ', '')}`} target="_blank" >
                            Call us
                        </a>
                    </div>
                </div>
            </section>
        </div>

    );
}

export default Messages;
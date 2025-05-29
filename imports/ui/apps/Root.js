import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { Roles } from 'meteor/alanning:roles';
import { withTracker } from 'meteor/react-meteor-data';
import Loading from '../components/Loading/Loading';
import App from './App';

const getUserName = (name) =>
  ({
    string: name,
    object: `${name.first} ${name.last}`,
  })[typeof name];

function RootWithRouter(props) {
  // Scroll to top if path changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return <App {...props} />;
}

RootWithRouter.propTypes = {
  loggedInUserId: PropTypes.string.isRequired,
};

function Root(props) {
  // Add tracking scripts

  useEffect(() => {
    /*

  <!-- Meta Pixel Code -->
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', 'xxxxxxxx');
    fbq('track', 'PageView');
    </script>
    
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=xxxxxxxx&ev=PageView&noscript=1"
    /></noscript>
    <!-- End Meta Pixel Code -->
    */

    const pixelId =
      Meteor.settings.public.analyticsSettings.facebookPixel.pixelId;

    if (pixelId) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      script.onload = () => {
        window.fbq('init', pixelId);
        window.fbq('track', 'PageView');
      };
      document.head.appendChild(script);

      const noscript = document.createElement('noscript');
      const img = document.createElement('img');
      img.height = 1;
      img.width = 1;
      img.style.display = 'none';
      img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
      noscript.appendChild(img);
      document.body.appendChild(noscript);
    }

    /*
 <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=xxxxxxxxx"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'xxxxxxx');
</script>
*/

    const gaId = Meteor.settings.public.analyticsSettings.googleTagManager.gaId;

    if (gaId) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          dataLayer.push(arguments);
        }
        gtag('js', new Date());
        gtag('config', gaId);
      };
      document.head.appendChild(script);
    }

    /*
  <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "xxxxxxx");
</script>
  */
    const clarityId = Meteor.settings.public.analyticsSettings.clarity.clId;

    if (clarityId) {
      const clarityUrl = 'https://www.clarity.ms/tag/';
      const script = document.createElement('script');
      script.async = true;
      script.innerHTML = `
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src='${clarityUrl}'+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityId}");
      `;
      document.head.appendChild(script);
    }
  }, []);

  if (props.loading) {
    return <Loading />;
  }

  return (
    <React.StrictMode>
      <BrowserRouter>
        <RootWithRouter {...props} />
      </BrowserRouter>
    </React.StrictMode>
  );
}

export default withTracker(() => {
  const loggingIn = Meteor.loggingIn();
  const userSubscription = Meteor.subscribe('users.userData'); // Meteor.user();
  const rolesSubscription = Meteor.subscribe('users.getRoles');
  const loading = !rolesSubscription.ready() || !userSubscription.ready();

  const user = Meteor.user();
  const userId = Meteor.userId();

  const name =
    user && user.profile && user.profile.name && getUserName(user.profile.name);
  const emailAddress = user && user.emails && user.emails[0].address;
  const emailVerified = user && user.emails && user.emails[0].verified;
  const productReturnables = user && user.productReturnables;
  const userSettings = user && user.settings;
  const globalStatuses = user && user.globalStatuses;

  return {
    loading,
    loggingIn,
    authenticated: !loggingIn && !!userId,
    productReturnables,
    name,
    emailAddress,
    emailVerified,
    date: new Date(),
    loggedInUserId: userId,
    loggedInUser: user,
    roles: !loading && Roles.getRolesForUser(userId),
    userSettings,
    globalStatuses,
  };
})(Root);

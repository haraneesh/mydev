import React from 'react';
import Icon from '../../../components/Icon/Icon';

import './Logout.scss';

const Logout = () => (
  <div className="Logout">
    <img
      src="https://nammasuvai.com/logo.png"
      alt="Namma Suvai"
    />
    <h1>Eat Healthy, Live Healthy</h1>
    <p>{'Don\'t forget to like and follow Namma Suvai on facebook.'}</p>
    <ul className="FollowUsElsewhere">
      <li><a href="https://www.facebook.com/NammaSuvai/"><Icon icon="facebook-official" /></a></li>
      {/* <li><a href="https://twitter.com/clvrbgl"><Icon icon="twitter" /></a></li>
      <li><a href="https://github.com/cleverbeagle"><Icon icon="github" /></a></li> */}
    </ul>
  </div>
);

Logout.propTypes = {};

export default Logout;

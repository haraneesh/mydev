import React from 'react';
import PropTypes from 'prop-types';

const PendingPool = {};
const ReadyPool = {};

class LoadImage extends React.Component {

  getInitialState() {
    return {
      ready: false,
    };
  }

  componentWillMount() {
    this._load(this.props.src);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.src !== this.props.src) {
      this.setState({ src: null });
      this._load(nextProps.src);
    }
  }

  render() {
    const style = this.state.src ?
      { backgroundImage: `url(${this.state.src})` } :
      undefined;

    return <div className="LoadImage" style={style} />;
  }

  _load(/* string */ src) {
    if (ReadyPool[src]) {
      this.setState({ src });
      return;
    }

    if (PendingPool[src]) {
      PendingPool[src].push(this._onLoad);
      return;
    }

    PendingPool[src] = [this._onLoad];

    const img = new Image();
    img.onload = () => {
      PendingPool[src].forEach(/* function */ (callback) => {
        callback(src);
      });
      delete PendingPool[src];
      img.onload = null;
      src = undefined;
    };
    img.src = src;
  }

  _onLoad(/* string */ src) {
    ReadyPool[src] = true;
    if (this.isMounted() && src === this.props.src) {
      this.setState({
        src,
      });
    }
  }
}

LoadImage.propTypes = {
  src: PropTypes.string.isRequired,
};

export default LoadImage;

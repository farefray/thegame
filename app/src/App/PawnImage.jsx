import React, {
  Component
} from 'react';

// todo
function encodeData(data) {
  return Object.keys(data).map(function(key) {
      return [key, data[key]].map(encodeURIComponent).join("=");
  }).join("&");
}

const imageBackends = {
  animated: 'http://18.200.195.197/phpsprites/animoutfit.php?',
  idle: 'http://18.200.195.197/phpsprites/outfit.php?'
}

const DEBUG = true;

class PawnImage extends Component {
  constructor (props) {
    super(props);
    this.state = {
      dimensions: {},
    };
    this.onImgLoad = this.onImgLoad.bind(this);
    this.calculatePadding = this.calculatePadding.bind(this);
  }

  onImgLoad ({
    target: img
  }) {
    // console.log('@onImgLoad - ', img.offsetHeight, 'vs', img.naturalHeight, ', ', img.offsetWidth, 'vs', img.naturalWidth);
    this.setState({
      dimensions: {
        height: img.naturalHeight,
        width: img.naturalWidth
      }
    });
    this.calculatePadding(img.naturalHeight);
  }


  calculatePadding (height) {
    
  }

  // TODO
  getSprite() {
    const params = encodeData({
      id: this.props.lookType || 1,
      direction: this.props.direction
    });

    if (DEBUG) {
      return 'https://vignette.wikia.nocookie.net/tibia/images/7/73/Dwarf.gif/revision/latest?cb=20150418075532&path-prefix=en';
    }

    return (this.props.idle ? imageBackends.idle : imageBackends.animated) + params;
  }
  render () {
    // Import result is the URL of your image
    // TODO: Store gifs locally so calculation is not required everytime
    const {
      width,
      height
    } = this.state.dimensions;
    const src = this.getSprite();
    
    const imgEl = <img className={
        `pawnImg ${(this.props.renderBase ? 'pawnSpawn' : '')} ` +
        `${this.props.name} ${(this.props.classList ? this.props.classList : '')}`
      } key={src} style={{
          width: width,
          height: height,
          /*
          marginTop: width === 32 ? '32px' : 'auto',
          marginLeft: width === 32 ? '32px' : 'auto'
          */
        }} src={src} alt='Pawn' onLoad={this.onImgLoad} />

    return (<div> {(this.props.renderBase ? <div key={this.props.renderBase} className={`${this.props.renderBase}`} style={{
      width: width
    }}></div> : '')} {
        imgEl
      } </div>
    );
  }
}

export default PawnImage;
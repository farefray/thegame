import React, {
  Component
} from 'react';

class PawnImage extends Component {

  constructor (props) {
    super(props);
    this.state = {
      dimensions: {},
      paddingTop: '0px',
      sideLength: this.props.sideLength
    };
    this.onImgLoad = this.onImgLoad.bind(this);
    this.reduceImageSize = this.reduceImageSize.bind(this);
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

  reduceImageSize (width, height, initial = 'true') {
    const sideLength = this.state.sideLength;
    if (width > sideLength || height > sideLength) {
      this.reduceImageSize(width * 0.9, height * 0.9, false);
    } else {
      if (!initial) {
        this.setState({
          dimensions: {
            height: height,
            width: width
          }
        });
        this.calculatePadding(height);
      }
    }
  }

  calculatePadding (height) {
    const sideLength = this.state.sideLength;
    const paddingTop = (sideLength - height) / 2;
    // console.log('@calculatePadding', paddingTop)
    this.setState({
      paddingTop: paddingTop
    });
  }

  render () {
    // Import result is the URL of your image
    // TODO: Store gifs locally so calculation is not required everytime
    const {
      width,
      height
    } = this.state.dimensions;
    this.reduceImageSize(width, height);
    const paddingTop = this.state.paddingTop;
    let src;
    if (this.props.newProps.monsterSprites) {
      if (!this.props.newProps.monsterSprites[this.props.name]) {
        console.log(this.props.newProps.monsterSprites);
        console.log('Undefined image', this.props.name, this.props.newProps.monsterSprites[this.props.name]);
      }

      const monsterImages = this.props.newProps.monsterSprites[this.props.name];
      src = this.props.back ? monsterImages.move_n : monsterImages.move_s;
    }
    const baseMarginTop = paddingTop + height - 15;
    const baseMarginLeft = Math.max(85 - width - 7, 0);
    const imgEl = < img
      className={
        `pawnImg ${(this.props.renderBase ? 'pawnSpawn' : (this.props.newProps.onGoingBattle ? (this.props.isBoard ? '' : 'pawnEnter') : 'pawnEnter'))} ` +
        `${this.props.name} ${(this.props.classList ? this.props.classList : '')}`
      }
      key={
        src
      }
      style={
        {
          paddingTop: paddingTop,
          width: width,
          height: height
        }
      }
      src={
        src
      }
      alt='Pokemon'
      onLoad={
        this.onImgLoad
      }
    />
    return (<div> {(this.props.renderBase ? <div key={this.props.renderBase} className={`PawnImageBase ${this.props.renderBase}`} style={{
      marginTop: (Number.isNaN(baseMarginTop) ? '' : baseMarginTop),
      marginLeft: (Number.isNaN(baseMarginLeft) ? '' : baseMarginLeft),
      width: (typeof width === 'number' ? width * 1.5 : '')
    }}></div> : '')} {
        imgEl
      } </div>
    );
  }
}

export default PawnImage;
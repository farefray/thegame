import React, { Component } from 'react';

class Audio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      props: this.props.newProps,
      loop: this.props.loopEnabled || false,
      source: this.props.source,
      volume: this.props.newProps.volume
    };
  }

  render() {
    console.log('@Audio', this.state.source);
    const ref = React.createRef();
    if (this.state.loop) {
      return <audio ref={ref} src={this.state.source} onLoadStart={() => (ref.current.volume = this.state.volume)} loop autoPlay />;
    } else {
      return <audio ref={ref} src={this.state.source} onLoadStart={() => (ref.current.volume = this.state.volume)} autoPlay />;
    }
  }
}

export default Audio;

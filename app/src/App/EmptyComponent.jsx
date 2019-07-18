import React, { Component } from 'react';

class EmptyComponent extends Component {
  constructor (props) {
    super(props);
    this.state = {};
  }

  render () {
   return '';
  }
}

export default EmptyComponent;
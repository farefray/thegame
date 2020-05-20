import React, { Component } from 'react';
import _ from 'lodash';
import Unit from '@/objects/Unit.tsx';

class UnitsWrapper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMounted: false,
      unitComponents: {},
      boardRef: props.boardRef
    };
  }

  static getDerivedStateFromProps(props, current_state) {
    if (!_.isEqual(current_state.unitComponents, props.unitComponents)) {
      return {
        unitComponents: props.unitComponents
      };
    }

    return null;
  }

  componentDidMount() {
    this.setState({ isMounted: true });
  }

  onUnitLifecycle(event) {
    this.props.onLifecycle(event);
  }

  render() {
    const { unitComponents, boardRef } = this.state;

    return boardRef?.current && Object.keys(unitComponents).map(pos => {
      const unit = unitComponents[pos];
      return (
        <Unit
          key={unit.key}
          unit={unit}
          onLifecycle={this.onUnitLifecycle.bind(this)}
        />
      );
    });
  }
}

export default UnitsWrapper;

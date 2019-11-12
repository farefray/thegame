import React, { Component } from 'react';
import _ from 'lodash';
import Unit from '@/objects/Unit.jsx';

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
    if (
      !_.isEqualWith(current_state.unitComponents, props.unitComponents, (fUnit, sUnit) => {
        return fUnit.key && sUnit.key && fUnit.key === sUnit.key && fUnit.id === sUnit.id;
      })
    ) {
      return {
        unitComponents: props.unitComponents
      };
    }

    return null;
  }

  componentDidMount() {
    this.setState({ isMounted: true });
  }

  getBoardBoundingClientRect() {
    return this.state.boardRef.current && this.state.boardRef.current.getBoundingClientRect();
  }

  render() {
    const { unitComponents } = this.state;

    return Object.keys(unitComponents).map(pos => {
      const unit = unitComponents[pos];
      return (
        <Unit
          key={unit.key}
          unit={unit}
          getBoardBoundingClientRect={this.getBoardBoundingClientRect.bind(this)}
          onLifecycle={this.props.onLifecycle}
        />
      );
    });
  }
}

export default UnitsWrapper;

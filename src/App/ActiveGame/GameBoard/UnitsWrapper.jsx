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

  onUnitLifecycle(event) {
    this.props.onLifecycle(event);
  }

  render() {
    const { unitComponents, boardRef } = this.state;

    return boardRef && boardRef.current && Object.keys(unitComponents).map(pos => {
      const unit = unitComponents[pos];
      return (
        <Unit
          key={unit.key}
          unit={unit}
          getBoardBoundingClientRect={this.getBoardBoundingClientRect.bind(this)}
          onLifecycle={this.onUnitLifecycle.bind(this)}
        />
      );
    });
  }
}

export default UnitsWrapper;

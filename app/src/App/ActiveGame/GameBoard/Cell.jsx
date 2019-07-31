import React, {
  Component
} from 'react';

import { getStatsEvent } from '../../../events'
import { isUndefined } from '../../../f';

/* TODO */
/*
  handleCellClick (el) {
    const unit = (el.props.isBoard ? (el.props.newProps.isActiveBattleGoing ? el.props.newProps.battleStartBoard[this.state.pos] : el.props.newProps.myBoard[this.state.pos]) : el.props.newProps.myHand[this.state.pos]);
    const prevSelectedUnit = el.props.newProps.selectedUnit;
    console.log('@handleCellClick pressed', el.props.value.x, ',', el.props.value.y)
    // console.log(' -', el.props.isBoard, el.props.newProps.isActiveBattleGoing, this.state.pos, unit, prevSelectedUnit)
    // If unit selected -> presses empty -> place piece 
    if (this.state.pos !== prevSelectedUnit.pos) { // Shouldn't do anything if same tile as SELECT_UNIT Tile
      el.props.newProps.dispatch({ type: 'SELECT_UNIT', selectedUnit: { ...el.props.value, isBoard: el.props.isBoard, pos: this.state.pos, unit: unit, displaySell: true } });
    } else if (!prevSelectedUnit.displaySell) {
      el.props.newProps.dispatch({ type: 'SELECT_UNIT', selectedUnit: { ...el.props.value, isBoard: el.props.isBoard, pos: this.state.pos, unit: unit, displaySell: true } });
    } else { // Deselect by doubleclick same unit
      el.props.newProps.dispatch({ type: 'SELECT_UNIT', selectedUnit: '' });
    }
    if (unit) { // Pressed unit
      console.log('Get Stats for', unit.name)
      el.props.newProps.dispatch({ type: 'NEW_UNIT_SOUND', newAudio: '' });
      getStatsEvent(el.props.newProps, unit.name);
    } else {
      el.props.newProps.dispatch({ type: 'SELECT_UNIT', selectedUnit: '' });
    }
  }
*/
function handleCellClick(el) {
  console.log('TODO', el);
}

export default function Cell ({ cellPosition, extraClasses, children }) {
  const className = `cell ${extraClasses}`;

  return <div id={cellPosition.toBoardPosition()} className={className} onClick={() => handleCellClick(this)}>
    {children}
  </div>;
}

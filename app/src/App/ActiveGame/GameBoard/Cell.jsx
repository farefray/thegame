import React, {
  Component
} from 'react';

import { getStatsEvent } from '../../../events'
import { isUndefined } from '../../../f';
import { toBoardPosition } from '../../../shared/BoardUtils.js';

class Cell extends Component {
  state = {
    ...this.state,
    pos: toBoardPosition(this.props.value.x, this.props.value.y),
    selPos: this.props.newProps.selectedUnit,
  }

  handleCellClick (el) {
    const unit = (el.props.isBoard ? (el.props.newProps.onGoingBattle ? el.props.newProps.battleStartBoard[this.state.pos] : el.props.newProps.myBoard[this.state.pos]) : el.props.newProps.myHand[this.state.pos]);
    const prevSelectedUnit = el.props.newProps.selectedUnit;
    console.log('@handleCellClick pressed', el.props.value.x, ',', el.props.value.y)
    // console.log(' -', el.props.isBoard, el.props.newProps.onGoingBattle, this.state.pos, unit, prevSelectedUnit)
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

  handleMouseOver (event, self) {
    //console.log('@handleMouseEvent', event, self)
    const x = event.clientX;
    const y = event.clientY;
    const el = document.elementFromPoint(x, y);
    let id = (el.id === '' ?
      (el.parentElement.id === '' ?
        (el.parentElement.parentElement.id === '' ?
          (el.parentElement.parentElement.parentElement.id === '' ?
            (el.parentElement.parentElement.parentElement.parentElementid === '' ? '' : el.parentElement.parentElement.parentElement.parentElement.id)
            : el.parentElement.parentElement.parentElement.id)
          : el.parentElement.parentElement.id)
        : el.parentElement.id) : el.id);
    if (self.props.newProps.mouseOverId !== id) {
      // console.log('Mousing Over:', id);
      self.props.newProps.dispatch({ type: 'SET_MOUSEOVER_ID', mouseOverId: id })
    }
  }

  render () {
    // console.log('@renderCell', this.props.selectedUnit)
    const selPos = this.props.newProps.selectedUnit;
    //console.log('@Cell.render', selPos, this.props.newProps.selectedUnit)
    let className = 'cell' +
      (!isUndefined(selPos) && this.props.isBoard === selPos.isBoard && selPos.displaySell &&
        selPos.x === this.props.value.x && selPos.y === this.props.value.y ? ' markedUnit' : '')
        + ' ' + (this.props.extraClasses);

    return <div id={this.state.pos} className={className} onClick={() => this.handleCellClick(this)}
            onMouseOver={(event) => this.handleMouseOver(event, this)}
          >
          {this.props.children}
          </div>;
  }
}

export default Cell;

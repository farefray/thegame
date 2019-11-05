import TargetPair from './TargetPair';

export default class TargetPairPool {
  constructor() {
    this._targetPairs = [];
  }

  add({ target, attacker }) {
    this._targetPairs.push(new TargetPair({ target, attacker }));
  }

  remove({ target, attacker }) {
    this._targetPairs = this._targetPairs.filter(targetPair => targetPair.target === target && targetPair.attacker === attacker);
  }

  removeByUnitID(id) {
    const affectedAttackers = this._targetPairs.filter(targetPair => targetPair.target.id === id).map(targetPair => targetPair.attacker);
    this._targetPairs = this._targetPairs.filter(targetPair => targetPair.target.id !== id && targetPair.attacker.id !== id);
    return { affectedAttackers };
  }

  findTargetByUnitID(id) {
    const relevantTargetPair = this._targetPairs.find(targetPair => targetPair.attacker.id === id);
    return relevantTargetPair && relevantTargetPair.target;
  }
}

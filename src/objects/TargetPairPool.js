import TargetPair from './TargetPair';

export default class TargetPairPool {
  constructor() {
    this._targetPairs = [];
  }

  add({ target, attacker }) {
    this._targetPairs.push(new TargetPair({ target, attacker }));
  }

  removeByUnitId(id) {
    this._targetPairs = this._targetPairs.filter(targetPair => targetPair.target.id !== id && targetPair.attacker.id !== id);
  }

  findTargetByUnitId(id) {
    const relevantTargetPair = this._targetPairs.find(targetPair => targetPair.attacker === id);
    return relevantTargetPair && relevantTargetPair.target;
  }
}

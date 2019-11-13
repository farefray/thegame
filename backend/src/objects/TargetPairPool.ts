import TargetPair, { TargetPairProps } from './TargetPair';

export default class TargetPairPool {
  private _targetPairs: TargetPair[];
  constructor() {
    this._targetPairs = [];
  }

  add({ attacker, target }: TargetPairProps) {
    this._targetPairs.push(new TargetPair({ attacker, target }));
  }

  remove({ target, attacker }: TargetPairProps) {
    this._targetPairs = this._targetPairs.filter(targetPair => targetPair.target === target && targetPair.attacker === attacker);
  }

  removeByAttackerId(id: string) {
    this._targetPairs = this._targetPairs.filter(targetPair => targetPair.attacker.id !== id);
  }

  removeByUnitId(id: string) {
    const affectedAttackers = this._targetPairs.filter(targetPair => targetPair.target.id === id).map(targetPair => targetPair.attacker);
    this._targetPairs = this._targetPairs.filter(targetPair => targetPair.target.id !== id && targetPair.attacker.id !== id);
    return { affectedAttackers };
  }

  findTargetByUnitId(id: string) {
    const relevantTargetPair = this._targetPairs.find(targetPair => targetPair.attacker.id === id);
    return relevantTargetPair && relevantTargetPair.target || null;
  }
}

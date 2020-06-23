import BattleUnit from '../../BattleUnit';

export interface TargetPairProps {
  target: BattleUnit;
  attacker: BattleUnit;
}

export default class TargetPair {
  private _target: BattleUnit;
  private _attacker: BattleUnit;
  constructor({ target, attacker }: TargetPairProps) {
    this._target = target;
    this._attacker = attacker;
  }

  get target() {
    return this._target;
  }

  get attacker() {
    return this._attacker;
  }
}

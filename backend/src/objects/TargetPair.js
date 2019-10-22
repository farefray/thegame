export default class TargetPair {
  constructor({ target, attacker }) {
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

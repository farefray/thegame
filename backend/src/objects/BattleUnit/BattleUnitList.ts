import BattleUnit from '../BattleUnit';
import Position from '../../shared/Position';

export default class BattleUnitList {
  private _list: BattleUnit[];

  constructor(battleUnitArray: BattleUnit[]) {
    this._list = battleUnitArray ?? [];
  }

  /** Internals */

  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => ({
        value: this._list[index++],
        done: index > this.size
      })
    };
  }

  forEach(fn) {
    for (const unit of this) {
      fn(unit)
    }
  }

  /** Getters */
  get unitNames() {
    return this._list.reduce((prev: string[], cur) => {
      prev.push(cur.name);
      return prev;
    }, []);
  }

  get size() {
    return this._list.length;
  }

  get random() {
    return this._list[Math.floor(Math.random() * this.size)];
  }

  /** Modification methods */

  push(unit: BattleUnit) {
    this._list.push(unit);
  }

  filter(conditionFn: Function, mutateInstance = false) {
    const filtered: BattleUnit[] = [];
    for (let iterator = 0; iterator < this._list.length; iterator++) {
      if (conditionFn(this._list[iterator])) {
        filtered.push(this._list[iterator]);
      }
    }

    if (mutateInstance) {
      this._list = filtered;
      return this;
    }

    return new BattleUnitList(filtered);
  }

  shuffle() {
    // Fisher-Yates shuffle
    for (let iterator = 0; iterator < this._list.length; iterator++) {
      // define target randomized index from given array
      const target = Math.floor(Math.random() * (iterator + 1));
      // if target index is different of current iterator then switch values
      if (target !== iterator) {
        const temporary = this._list[iterator];
        // switch values
        this._list[iterator] = this._list[target];
        this._list[target] = temporary;
      }
    }

    return this;
  }

  /** Searching methods */

  find(condition) : BattleUnit | undefined {
    return this._list.find(condition)
  }

  byTeam(teamId: number) {
    return this.filter((unit) => unit.teamId === teamId);
  }

  findByName(searchName) {
    return this._list.find(({ name }) => name === searchName);
  }

  areDamaged() {
    return this.filter(({ health, maxHealth }) => health < maxHealth);
  }

  fromPositions(positions: Array<Position>): BattleUnitList {
    const units = new BattleUnitList([]);

    for (const unit of this) {
      const { x, y } = unit;
      const isOnPositions = positions.reduce((prev, curr) => (prev || curr.x === x && curr.y === y), false);
      if (isOnPositions) {
        units.push(unit);
      }
    }

    return units;
  }

  /** Output methods */
  toJSON() {
    // TODO optimize for socket transfer
    return this._list;
  }
}

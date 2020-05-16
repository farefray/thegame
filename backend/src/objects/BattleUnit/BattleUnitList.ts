import BattleUnit from '../BattleUnit';

export default class BattleUnitList {
  private _list: BattleUnit[];

  constructor(battleUnitArray: BattleUnit[]) {
    this._list = battleUnitArray ?? [];
  }

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

  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => ({
        value: this._list[index++],
        done: index > this.size
      })
    };
  }

  push(unit: BattleUnit) {
    this._list.push(unit);
    console.log("BattleUnitList -> push -> this._list", this._list)
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

  byTeam(teamId: number) {
    return this.filter((unit) => unit.teamId === teamId);
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

  findByName(searchName) {
    return this._list.find(({ name }) => name === searchName);
  }

  find(condition) {
    return this._list.find(condition);
  }

  toJSON() {
    // TODO optimize for socket transfer
    return this._list;
  }
}

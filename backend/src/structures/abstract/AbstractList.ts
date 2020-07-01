export default class AbstractList<T> {
  protected _list: Array<T>;

  constructor(initialList?: Array<T>) {
    this._list = initialList ?? [];
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

  forEach(fn) {
    for (const unit of this) {
      fn(unit)
    }
  }

  values() {
    return this._list;
  }

  map(callback) {
    const resultArray: Array<T> = [];
    for (let index = 0; index < this._list.length; index++) {
        resultArray.push(callback(this._list[index], index, this._list));
    }

    return resultArray;
  }

  get(index: number) {
    return this._list[index];
  }

  shift() {
    return this._list.shift();
  }

  pop() {
    return this._list.pop();
  }

  push(entity) {
    this._list.push(entity);
    return this;
  }

  pushAll(entities) {
    this._list.push(...entities);
    return this;
  }

  filter(conditionFn: Function, mutateInstance = false) {
    const filtered: Array<T> = [];
    for (let iterator = 0; iterator < this._list.length; iterator++) {
      if (conditionFn(this._list[iterator])) {
        filtered.push(this._list[iterator]);
      }
    }

    if (mutateInstance) {
      this._list = filtered;
      return this;
    }

    return new AbstractList<T>(filtered);
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

  find(condition) {
    return this._list.find(condition)
  }

  findIndex(condition) {
    return this._list.findIndex(condition);
  }

  toSocket() {
    return this._list.reduce((prev: T[], cur: any) => {
      if ('toSocket' in cur) {
        prev.push(cur.toSocket());
      } else {
        prev.push(JSON.parse(JSON.stringify(cur)));
      }

      return prev;
    }, []);
  }
}
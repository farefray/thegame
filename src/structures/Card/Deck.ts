import Card from "../Card";
import AbstractList from "../abstract/AbstractList";

export default class Deck extends AbstractList<Card> {
  public eject(index: number) {
    const ejected = this._list.splice(index, 1);
    return ejected[0];
  }

  public isEmpty() {
    return this._list.length === 0;
  }

  public clean() {
    this._list = [];
  }

  public cardUniqueids() {
    return this.values().reduce((prev: any, cur: Card) => {
      prev.push({
        uuid: cur.uuid
      });

      return prev;
    }, [])
  }
}

import Card from "../Card";
import AbstractList from "../abstract/AbstractList";

export default class Deck extends AbstractList<Card> {
  public eject(index: number) {
    return this._list.slice(index, 1);
  }
}

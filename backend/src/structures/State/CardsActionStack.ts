import { CardAction } from '../../typings/Card';
import { EventBusUpdater } from '../abstract/EventBusUpdater';
import { EVENT_TYPE } from '../../typings/EventBus';

export default class CardsActionStack extends EventBusUpdater {
  private _cardActions: CardAction[];

  constructor(subscribers) {
    super(EVENT_TYPE.CARD_PLAY, subscribers);
    this._cardActions = [];
  }

  add(cardAction: CardAction) {
    this._cardActions.push(cardAction);
  }

  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => ({
        value: this._cardActions[index++],
        done: index > this._cardActions.length
      })
    };
  }

  toSocket() {
    return {
      cardActions: this._cardActions
    };
  }
}
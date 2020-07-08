import { CardAction } from '../../typings/Card';
import { EventBusUpdater } from '../abstract/EventBusUpdater';
import { EVENT_TYPE } from '../../typings/EventBus';

export default class CardsActionStack extends EventBusUpdater {
  private cardActions: CardAction[];

  constructor(subscribers) {
    super(EVENT_TYPE.CARD_PLAY, subscribers);
    this.cardActions = [];
  }

  add(cardAction: CardAction) {
    this.cardActions.push(cardAction);
  }


  toSocket() {
    return {
      cardActions: this.cardActions
    };
  }
}
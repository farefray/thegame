import { EventBusUpdater } from "../abstract/EventBusUpdater";
import { CARD_TYPES, CardEffect, ICardAction } from "../../typings/Card";
import { FirebaseUserUID } from "../../utils/types";
import { EVENT_TYPE } from "../../typings/EventBus";


export class CardAction extends EventBusUpdater {
  public uuid: string;
  public type: CARD_TYPES;
  public owner: FirebaseUserUID;
  public effects: CardEffect[];
  public monsterName?: string;

  constructor(config: ICardAction, subscribers) {
    super(EVENT_TYPE.CARD_PLAY, subscribers);

    this.uuid = config.uuid;
    this.type = config.type;
    this.owner = config.owner;
    this.effects = config.effects;
  }

  toSocket() {
    return this; // todo remove not nessesary stuff
  }
}
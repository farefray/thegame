import { EventBusUpdater } from "../abstract/EventBusUpdater";
import { CARD_TYPES, CardEffect, ICardAction, ABILITY_PHASE } from "../../typings/Card";
import { UserUID } from "../../utils/types";
import { EVENT_TYPE } from "../../typings/EventBus";


export class CardAction extends EventBusUpdater {
  public uuid: string;
  public type: CARD_TYPES;
  public owner: UserUID;
  public effects: CardEffect[];
  public monsterName?: string;
  public phase: ABILITY_PHASE;

  constructor(config: ICardAction, subscribers) {
    super(EVENT_TYPE.CARD_PLAY, subscribers);

    this.uuid = config.uuid;
    this.type = config.type;
    this.owner = config.owner;
    this.effects = config.effects;
    this.phase = config.phase;
    this.monsterName = config.monsterName;
  }

  toSocket() {
    return this; // todo remove not nessesary stuff
  }
}
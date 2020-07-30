import BoardMatrix from './Battle/BoardMatrix';
import { EventBusUpdater } from './abstract/EventBusUpdater';
import { EVENT_TYPE, EVENT_SUBTYPE } from '../typings/EventBus';
import Deck from './Card/Deck';
import Card from './Card';
import CardsFactory from '../factories/CardsFactory';
import MonstersFactory from '../factories/MonstersFactory';
import { UserUID } from '../utils/types';
import { CardAction } from './Card/CardAction';
import Merchantry from './Merchantry';

const BASE_DECK_CONFIG = ['Dwarf', 'Bless', 'Gold_Coin', 'Gold_Coin', 'Gold_Coin', 'Gold_Coin', 'Gold_Coin', 'Gold_Coin', 'Knife', 'Knife'];
const HAND_SIZE = 5;

export default class Player extends EventBusUpdater {
  public userUID: UserUID;
  public health: number = 50;
  public exp: number = 0;
  public gold: number = 0;
  public board: BoardMatrix = new BoardMatrix(8, 8);

  public hand = new Deck();
  public deck = new Deck();
  public discard = new Deck();

  public isAI = false;

  constructor(id: UserUID, subscribers: Array<UserUID>) {
    super(EVENT_TYPE.PLAYER_UPDATE, subscribers);

    // fill starting deck
    const cardsFactory = new CardsFactory();
    for (let index = 0; index < BASE_DECK_CONFIG.length; index++) {
      this.deck.push(cardsFactory.createCard(BASE_DECK_CONFIG[index]));
    }

    this.deck.shuffle();

    this.userUID = id;
  }

  getUID() {
    return this.userUID;
  }

  public changeGold(addendum: number, emit = false) {
    this.gold += addendum;

    if (emit) {
      this.invalidate(EVENT_SUBTYPE.PLAYER_GOLD_CHANGE);
    }
  }

  public cardPurchase(card: Card) {
    this.changeGold(-card.cost, true);
    this.addToDiscard(card);
  }

  public addToBoard(cardAction: CardAction) {
    if (cardAction.monsterName) {
      const unit = MonstersFactory.createBattleUnit(cardAction.monsterName);
      const position = unit.getPreferablePosition(this.board.freeSpots());
      unit.rearrangeToPos(position);
      this.board.setCell(position.x, position.y, unit);
    }
  }

  public moveToDiscard(cardAction: CardAction) {
    const handCardIndex = this.hand.findIndex((handCard) => handCard.uuid === cardAction.uuid);
    this.discard.push(this.hand.eject(handCardIndex));
  }

  public addToDiscard(card: Card) {
    this.discard.push(card);

    this.invalidate(EVENT_SUBTYPE.PLAYER_CARDS_UPDATED);
  }

  public dealCards() {
    while (this.hand.size < HAND_SIZE && (!this.deck.isEmpty() || this.discard.size > 0)) {
      if (!this.deck.isEmpty()) {
        const card = this.deck.eject(0);
        this.hand.push(card);
      } else if (this.discard.size > 0) {
        this.deck.pushAll(this.discard.values()).shuffle();
        this.discard.clean();
      }
    }

    this.invalidate(EVENT_SUBTYPE.PLAYER_CARDS_UPDATED);
  }


  /////// OLD

  isDead() {
    return this.health <= 0;
  }

  /** AI method */
  public tradeRound(merchantry: Merchantry) {
    return -1;
  }

  toSocket(eventSubtype?) {
    let invalidatedObject = {};

    switch (eventSubtype) {
      case EVENT_SUBTYPE.PLAYER_GOLD_CHANGE: {
        invalidatedObject = {
          gold: this.gold
        }

        break;
      }

      case EVENT_SUBTYPE.PLAYER_CARDS_UPDATED: {
        invalidatedObject = {
          hand: this.hand.toSocket(),
          deck: this.deck.cardUniqueids(),
          discard: this.discard.toSocket()
        };

        break;
      }

      case EVENT_SUBTYPE.PLAYER_SYNC:
      default: {
        invalidatedObject = {
          health: this.health,
          gold: this.gold,
          board: this.board.toSocket(),
          hand: this.hand.toSocket(),
          deck: this.deck.cardUniqueids(),
          discard: this.discard.toSocket()
        };

        break;
      }
    }


    return {...invalidatedObject, ...{ uuid: this.userUID }}
  }
}

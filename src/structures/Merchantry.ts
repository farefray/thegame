import CardsFactory from '../factories/CardsFactory';
import { EventBusUpdater } from './abstract/EventBusUpdater';
import { EVENT_TYPE, EVENT_SUBTYPE } from '../typings/EventBus';
import Deck from './Card/Deck';
import { UserUID } from '../utils/types';

enum ACTIVEPLAYER_INDEX {
  NONE = -1, FIRST, SECOND
}

export default class Merchantry extends EventBusUpdater {
  DECK_SIZE = 48;
  REVEALED_CARDS_SIZE = 5;

  private deck = new Deck();
  private revealedCards = new Deck();

  private activePlayerIndex: ACTIVEPLAYER_INDEX;
  private players: Array<UserUID>;

  constructor(subscribers) {
    super(EVENT_TYPE.MERCHANTRY_UPDATE, subscribers);

    this.players = subscribers;

    const cardsFactory = new CardsFactory();
    for (let i = 0; i < this.DECK_SIZE; i++) {
      const card = cardsFactory.getRandomCard();
      this.deck.push(card);
    }

    this.activePlayerIndex = ACTIVEPLAYER_INDEX.NONE;
    this.revealCards();
  }

  getDeck() {
    return this.deck;
  }

  getRevealedCards() {
    return this.revealedCards;
  }

  revealCards() {
    while (this.deck.size > 0 && this.revealedCards.size < this.REVEALED_CARDS_SIZE) {
      const deckCard = this.deck.shift();

      if (deckCard) {
        this.revealedCards.push(deckCard);
      }
    }

    this.invalidate();
  }

  activate(): UserUID {
    if (this.activePlayerIndex === ACTIVEPLAYER_INDEX.NONE) { // first round
      this.activePlayerIndex = Math.round(Math.random());
    } else {
      this.activePlayerIndex = this.activePlayerIndex === ACTIVEPLAYER_INDEX.FIRST ? ACTIVEPLAYER_INDEX.SECOND : ACTIVEPLAYER_INDEX.FIRST;
    }

    this.invalidate(EVENT_SUBTYPE.MERCHANTRY_ACTIVATE);
    return this.players[this.activePlayerIndex];
  }

  toSocket() {
    return {
      revealedCards: this.revealedCards.toSocket(),
      activePlayerUID: this.players[this.activePlayerIndex]
    }
  }
}
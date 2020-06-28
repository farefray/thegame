import CardsFactory from '../factories/CardsFactory';
import Player from "./Player";
import { EventBusUpdater } from './abstract/EventBusUpdater';
import { EVENTBUS_MESSAGE_TYPE } from '../typings/EventBus';
import { FirebaseUser } from '../services/ConnectedPlayers';
import Deck from './Card/Deck';

export default class Merchantry extends EventBusUpdater {
  DECK_SIZE = 48;
  REVEALED_CARDS_SIZE = 5;

  private deck = new Deck();
  private revealedCards = new Deck();

  constructor(players: IterableIterator<Player>) {
    super(EVENTBUS_MESSAGE_TYPE.MERCHANTRY_UPDATE, [...players].reduce((subscribers: Array<FirebaseUser['uid']>, player) => {
      subscribers.push(player.getUID());
      return subscribers;
    }, []));

    const cardsFactory = new CardsFactory(players);
    for (let i = 0; i < this.DECK_SIZE; i++) {
      this.deck.push(cardsFactory.getRandomCard());
    }

    this.revealCards();

    this.invalidate();
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
  }

  toSocket() {
    return {
      revealedCards: this.revealedCards.map(card => ({
        card: card.toSocket()
      }))
    }
  }
}
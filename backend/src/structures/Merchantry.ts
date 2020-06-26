import CardsFactory from '../factories/CardsFactory';
import Player from "./Player";
import Card from './Card';
import { EventBusUpdater } from './abstract/EventBusUpdater';
import { EVENTBUS_MESSAGE_TYPE } from '../typings/EventBus';
import { FirebaseUser } from '../services/ConnectedPlayers';

export default class Merchantry extends EventBusUpdater {
  DECK_SIZE = 48;
  REVEALED_CARDS_SIZE = 5;

  private deck: Array<Card> = [];
  private revealedCards: Array<Card> = [];

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

    this.invalidate(true);
  }

  getDeck() {
    return this.deck;
  }

  getRevealedCards() {
    return this.revealedCards;
  }

  revealCards() {
    while (this.deck.length > 0 && this.revealedCards.length < this.REVEALED_CARDS_SIZE) {
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
import BattleUnitList from "./Battle/BattleUnitList";
import CardsFactory from '../factories/CardsFactory';
import Player from "./Player";
import { MonsterInterface } from "../typings/Monster";

const DECK_SIZE = 48;
const REVEALED_CARDS_SIZE = 5;
export default class Merchantry {
  private deck: Array<MonsterInterface> = [];
  private revealedCards: Array<MonsterInterface> = [];

  constructor(players?: IterableIterator<Player>) {
    const monsterService = MonstersService.getInstance();
    for (let i = 0; i < DECK_SIZE; i++) {
      const randomCard = monsterService.getRandomUnit();
      this.deck.push(randomCard);
    }

    this.revealCards();
  }

  revealCards() {
    while (this.deck.length > 0 && this.revealedCards.length < REVEALED_CARDS_SIZE) {
      const deckCard = this.deck.shift();

      if (deckCard) {
        this.revealedCards.push(deckCard);
      }
    }
  }

}
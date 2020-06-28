import { randomProperty } from '../utils/randomProperty';
import Card from '../structures/Card';
import MonstersFactory from './MonstersFactory';
import * as cardsConfigs from './configs/cards';
import { CardConfig } from '../typings/Card';
import Player from '../structures/Player';

class CardsFactory {
  private _cardNames: Array<string> = [];

  constructor(players?: IterableIterator<Player>) {
    // TODO[phase3]: Player personal cards can be shuffled into deck
    const cardNames = Object.keys(cardsConfigs);
    this._cardNames.push(...cardNames);
  }

  public getAllCards() {
    return this._cardNames;
  }

  public getRandomCardName() {
    return randomProperty(this._cardNames);
  }

  public getRandomCard() {
    return this.createCard(randomProperty(this._cardNames));
  }

  public createCard(cardName: string) {
    if (!this._cardNames.includes(cardName)) {
      throw new Error('No such card exists');
    }

    const monster = MonstersFactory.createUnit(cardName);
    const cardConfig = (cardsConfigs[cardName] ? cardsConfigs[cardName] : cardsConfigs.default) as CardConfig;
    return new Card(cardName, cardConfig, monster);
  }
}

export default CardsFactory;

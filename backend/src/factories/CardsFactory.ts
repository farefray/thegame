import { randomProperty } from '../utils/randomProperty';
import Card from '../structures/Card';
import MonstersFactory from './MonstersFactory';
import * as cardConfigs from './configs/cards';
import { CardConfig } from '../typings/Card';

class CardsFactory {
  private static instance: CardsFactory;
  private _cardNames: Array<string> = [];

  private constructor() {
    const monsterNames = MonstersFactory.getAllMonsters();

    this._cardNames.push(...monsterNames);
  }

  public static getInstance(): CardsFactory {
    if (!CardsFactory.instance) {
      CardsFactory.instance = new CardsFactory();
    }

    return CardsFactory.instance;
  }

  public getRandomCardName() {
    return randomProperty(this._cardNames);
  }

  public createCard(cardName: string) {
    if (!this._cardNames.includes(cardName)) {
      throw new Error('No such card exists');
    }

    const monster = MonstersFactory.createUnit(cardName);
    const cardConfig = (cardConfigs[cardName] ? cardConfigs[cardName] : cardConfigs.default) as CardConfig;
    return new Card(monster, cardConfig);
  }
}

export default CardsFactory;

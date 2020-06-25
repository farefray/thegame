import { randomProperty } from '../utils/randomProperty';
import Card from '../structures/Card';
import MonstersFactory from './MonstersFactory';
import * as cardConfigs from './configs/cards';
import { CardConfig } from '../typings/Card';
import Player from '../structures/Player';

class CardsFactory {
  private _cardNames: Array<string> = [];

  constructor(players?: IterableIterator<Player>) {
    // TODO[P3]: Player personal cards can be shuffled into deck
    const monsterNames = MonstersFactory.getAllMonsters();

    this._cardNames.push(...monsterNames);
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
    const cardConfig = (cardConfigs[cardName] ? cardConfigs[cardName] : cardConfigs.default) as CardConfig;
    return new Card(monster, cardConfig);
  }
}

export default CardsFactory;

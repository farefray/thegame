import { MonsterInterface } from "../typings/Monster";
import { CardConfig } from "../typings/Card";

export default class Card {
  private monster: MonsterInterface;
  private config: CardConfig;

  constructor(monster: MonsterInterface, cardConfig: CardConfig) {
    this.monster = monster;
    this.config = cardConfig;
  }
}
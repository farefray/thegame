export enum EFFECT_TYPE {
  GOLD = 'GOLD',
  DAMAGE = 'DAMAGE',
  HEAL = 'HEAL'
}

export interface CardEffect {
  type: EFFECT_TYPE
  payload: any
}

export interface CardAction {
  uuid: string;
  monsterName?: string;
  effects: Array<CardEffect>;
  owner: string;
}

export interface Card {
  uuid: string;
}
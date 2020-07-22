import { UserUID } from "../utils/types";

export interface CardConfig {
  cost: number,
  instant?: {
    health?: number
    damage?: number
    gold?: number
  }
  victory?: {
    health?: number
    damage?: number
    gold?: number
  }
}

export enum CARD_TYPES {
  CARD_MONSTER,
  CARD_ITEM
}

export enum ABILITY_PHASE {
  INSTANT,
  VICTORY
}


export enum EFFECT_TYPE {
  GOLD = 'GOLD',
  DAMAGE = 'DAMAGE',
  HEAL = 'HEAL'
}

export interface CardEffect {
  type: EFFECT_TYPE
  payload: any
}

export interface ICardAction {
  uuid: string,
  type: CARD_TYPES,
  owner: UserUID,
  effects: CardEffect[],
  phase: ABILITY_PHASE,
  isDone: boolean,
  monsterName?: string
}

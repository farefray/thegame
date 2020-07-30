export enum EFFECT_TYPE {
  GOLD = 'GOLD',
  DAMAGE = 'DAMAGE',
  HEAL = 'HEAL'
}

export interface CardEffect {
  type: EFFECT_TYPE
  payload: any
}

export enum ABILITY_PHASE {
  INSTANT,
  VICTORY
}

export interface CardAction {
  uuid: string
  monsterName?: string
  effects: Array<CardEffect>
  owner: string
  phase: ABILITY_PHASE
  isDone: boolean
}

export interface Card {
  uuid: string
}

export const CARD_WIDTH = 32 * 4;
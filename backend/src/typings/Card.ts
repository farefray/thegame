import { FirebaseUserUID } from "../utils/types";

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
  GOLD,
  DAMAGE,
  HEAL
}

export interface CardEffect {
  type: EFFECT_TYPE
  payload: any
}

export interface CardAction {
  uuid: string,
  type: CARD_TYPES,
  owner: FirebaseUserUID,
  effects: CardEffect[]
}
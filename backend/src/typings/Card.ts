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
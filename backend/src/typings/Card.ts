export interface CardConfig {
  cost: number,
  instant?: {
    health?: number
    damage?: number
    gold?: number
  }
  extra?: {
    health?: number
    damage?: number
    gold?: number
  }
}

export enum CARD_TYPES {
  CARD_MONSTER,
  CARD_ITEM
}
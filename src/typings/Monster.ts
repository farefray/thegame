import { SpellOptions } from "../structures/BattleUnit";

export interface MonsterInterface {
  name?: string; // auto-generated later
  spriteSize: number;
  lookType: number;
  cost: number;
  health: {
    now?: number,
    max: number,
  };
  mana?: {
    max?: number,
    regen?: number,
  };
  attack?: {
    value: number,
    range: number,
    speed: number,
    particleID?: string,
  };
  armor?: number;
  walkingSpeed?: number;
  spell?: SpellOptions;
  specialty?: {
    targetable?: boolean, // can be taken as a target by other units
    passive?: boolean, // ignores lifecycle loop targeting/moving actions
    shopRestricted?: boolean, // not allowed to be randomed for unit shop
  };
}
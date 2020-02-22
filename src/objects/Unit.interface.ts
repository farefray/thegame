import BaseEffect_T from './Unit/EffectsWrapper/BaseEffect_T';

export interface IState {
  x: number;
  y: number;
  id: string;
  key: string;
  direction: number;
  isMoving: boolean;
  stats: any;
  effects: Array<BaseEffect_T>;
  mana: number;
  health: number;
  unitSpriteDimensions: number;
  isLoaded: boolean;
  top: number;
  left: number;
  transition: string;
  isDead: boolean;
}

export interface IProps {
  unit: any;
  onLifecycle: Function;
}

export interface MoveOptions {
  instant?: boolean;
  direction?: number;
}

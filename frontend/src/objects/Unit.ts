import { Text } from './Unit/EffectsWrapper/Text';
import { Effect } from './Unit/EffectsWrapper/Effect';
import { Particle } from './Unit/EffectsWrapper/Particle';

export interface IState {
  x: number;
  y: number;
  id: string;
  key: string;
  direction: number;
  isMoving: boolean;
  stats: any;
  effects: Array<Effect | Text | Particle>;
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

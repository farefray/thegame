
export interface IState {
  x: number;
  y: number;
  id: string;
  direction: number;
  isMoving: boolean;
  stats: any;
  effects: Array<any>; // TODO
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
  onLifecycle?: Function;
}

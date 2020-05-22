
export interface IState {
  x: number;
  y: number;
  id: string;
  key: string;
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
  isDraggable: boolean
}

export interface IProps {
  unit: any;
  onLifecycle?: Function;
  isDraggable?: boolean
}

export interface MoveOptions {
  instant?: boolean;
  direction?: number;
}

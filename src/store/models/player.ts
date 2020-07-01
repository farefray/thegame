import { action, thunk, Action, Thunk } from 'easy-peasy';

export interface PlayerModel {
  health: number;
  gold: number;
  boardUnits: [];

  hand: [];
  deck: [];
  discard: [];
}

const playerModel: PlayerModel = {
  health: 100,
  gold: 0,
  boardUnits: [],

  hand: [],
  deck: [],
  discard: []
};

export default playerModel;

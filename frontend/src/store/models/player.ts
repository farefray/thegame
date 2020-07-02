import { action, thunk, Action, Thunk } from 'easy-peasy';

export interface PlayerModel {
  health: number;
  gold: number;
  board: [];
  hand: [];
  deck: [];
  discard: [];

  updatePlayer: Action<PlayerModel, any>;
}

const playerModel: PlayerModel = {
  health: 50,
  gold: 0,
  board: [],
  hand: [],
  deck: [],
  discard: [],

  updatePlayer: action((state, payload) => {
    state.health = payload.health;
    state.gold = payload.gold;
    state.board = payload.board;
    state.hand = payload.hand;
    state.deck = payload.deck;
    state.discard = payload.discard;
  }),
};

export default playerModel;

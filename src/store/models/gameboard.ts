import { action, Action } from 'easy-peasy';

export interface GameboardModel {
  isActiveBattleGoing: boolean;
  actionStack: [];
  startBoard: [];

  startBattle: Action<GameboardModel, any>;
  endBattle: Action<GameboardModel>;
}

const gameboardModel: GameboardModel = {
  isActiveBattleGoing: false,
  actionStack: [],
  startBoard: [],

  startBattle: action((state, payload) => {
    state.isActiveBattleGoing = true;
    state.actionStack = payload.actionStack;
    state.startBoard = payload.startBoard;
  }),

  endBattle: action((state) => {
    state.isActiveBattleGoing = false;
  })

};

export default gameboardModel;

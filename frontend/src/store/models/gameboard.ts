import { action, thunk, Action, Thunk } from 'easy-peasy';

export interface GameboardModel {
  isActiveBattleGoing: boolean;
  actionStack: [];
  battleStartBoard: [];
}

const gameboardModel: GameboardModel = {
  isActiveBattleGoing: false,
  actionStack: [],
  battleStartBoard: [],


};

export default gameboardModel;

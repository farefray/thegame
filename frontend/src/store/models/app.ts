
import { action, Action, Computed, computed } from 'easy-peasy';
import { StoreModel } from '../model';

export interface AppModel {
  isConnected: boolean;
  isGameLive: boolean;

  setConnected: Action<AppModel, boolean>;
  setGameLive: Action<AppModel, boolean>;

  notification: object|null;
  setNotification: Action<AppModel, object>;

  countdown: number;
  setCountdown: Action<AppModel, number>;

  gamePhase: number;
  setGamePhase: Action<AppModel, number>;

  tradingPlayer: Computed<AppModel, string, StoreModel>;
}

const appModel: AppModel = {
  isConnected: false,
  setConnected: action((state, payload) => {
    state.isConnected = payload;
  }),

  isGameLive: false,
  setGameLive: action((state, payload) => {
    state.isGameLive = payload;
  }),

  notification: null,
  setNotification: action((state, payload) => {
    state.notification = payload;
  }),

  countdown: 0,
  setCountdown: action((state, payload) => {
    state.countdown = payload;
  }),

  gamePhase: 0,
  setGamePhase: action((state, phase) => {
    state.gamePhase = phase;
  }),

  tradingPlayer: computed([
    state => state.gamePhase,
    (state, storeState) => storeState.merchantry.activeUID
  ],
    (gamePhase, activeUID) => {
      return gamePhase === 2 // display trading played only while trade game step
        ? activeUID
        : '';
  })
};

export default appModel;
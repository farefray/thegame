
import { action, Action } from 'easy-peasy';

export interface AppModel {
  isConnected: boolean;
  isGameLive: boolean;

  setConnected: Action<AppModel, boolean>;

  players: Array<string>;
  round: number;
  notification: object|null;
  setNotification: Action<AppModel, object>;
  countdown: number;
  setCountdown: Action<AppModel, number>;
}

const appModel: AppModel = {
  isConnected: false,
  setConnected: action((state, payload) => {
    state.isConnected = payload;
  }),

  isGameLive: false,
  players: [],
  round: 1,
  notification: null,
  setNotification: action((state, payload) => {
    state.notification = payload;
  }),
  countdown: 0,
  setCountdown: action((state, payload) => {
    state.countdown = payload;
  })
};

export default appModel;

import { action, thunk, Action, Thunk } from 'easy-peasy';

export interface AppModel {
  isConnected: boolean;
  isGameLive: boolean;

  setConnected: Action<AppModel, boolean>;
  setGameLive: Action<AppModel, boolean>;

  stateUpdate: Thunk<AppModel, any>;

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
  setGameLive: action((state, payload) => {
    state.isGameLive = payload;
  }),

  stateUpdate: thunk(async (actions, payload) => {
    actions.setGameLive(true)

    // restore/replace whole app state
  }),

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
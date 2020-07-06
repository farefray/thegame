
import { action, Action } from 'easy-peasy';

export interface AppModel {
  isConnected: boolean;
  isGameLive: boolean;

  setConnected: Action<AppModel, boolean>;
  setGameLive: Action<AppModel, boolean>;

  stateUpdate: Action<AppModel, any>;

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
  setGameLive: action((state, payload) => { // not used
    state.isGameLive = payload;
  }),

  stateUpdate: action((state, payload) => {
    state.isGameLive = true; // this is the only change which ic executed now. Later we may change to thunk and execute more things

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
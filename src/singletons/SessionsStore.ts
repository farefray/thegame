import Session from "../objects/Session";


export default class SessionsStore {
  private static instance: SessionsStore;

  private _sessions: Map<string, Session>;

  private constructor() {
    this._sessions = new Map();
  }

  public static getInstance(): SessionsStore {
    if (!SessionsStore.instance) {
      SessionsStore.instance = new SessionsStore();
    }

    return SessionsStore.instance;
  }

  store(session) {
    this._sessions.set(session.ID, session);
  }

  get(sessionID) {
    return this._sessions.get(sessionID);
  }

  destroy(sessionID) {
    this._sessions.delete(sessionID);
  }
}

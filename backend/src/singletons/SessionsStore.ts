import Session from "../objects/Session";
import { SessionID } from "../utils/types";

export default class SessionsStore {
  private static instance: SessionsStore;

  private _sessions: Map<SessionID, Session>;

  private constructor() {
    this._sessions = new Map();
  }

  public static getInstance(): SessionsStore {
    if (!SessionsStore.instance) {
      SessionsStore.instance = new SessionsStore();
    }

    return SessionsStore.instance;
  }

  store(session: Session) {
    this._sessions.set(session.getID(), session);
  }

  getByID(sessionID) {
    return this._sessions.get(sessionID);
  }

  // TODO session removale
  // destroy(socketID) {
  //   this._sessions.delete(socketID);
  // }
}

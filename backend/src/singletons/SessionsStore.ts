import Session from "../objects/Session";
import { SocketID, SessionID } from "../utils/types";

export default class SessionsStore {
  private static instance: SessionsStore;

  private _sessions: Map<SessionID, Session>;
  private _sockets: Map<SocketID, SessionID>;

  private constructor() {
    this._sessions = new Map();
    this._sockets = new Map();
  }

  public static getInstance(): SessionsStore {
    if (!SessionsStore.instance) {
      SessionsStore.instance = new SessionsStore();
    }

    return SessionsStore.instance;
  }

  store(session: Session, clients: Array<SocketID>) {
    this._sessions.set(session.getID(), session);

    clients.forEach(socketID => {
      this._sockets.set(socketID, session.getID());
    });
  }

  getBySocket(socketID) {
    console.log("SessionsStore -> getBySocket -> socketID", socketID)
    const sessionID = this._sockets.get(socketID);
    console.log("SessionsStore -> getBySocket -> this._sockets", this._sockets)
    if (sessionID) {
      return this.getByID(sessionID);
    }
  }

  getByID(sessionID) {
    return this._sessions.get(sessionID);
  }

  // TODO session removale
  // destroy(socketID) {
  //   this._sessions.delete(socketID);
  // }
}

import Session from "../objects/Session";
import { SessionID } from "../utils/types";

export default class SessionsService {
  private static instance: SessionsService;

  private _sessions: Map<SessionID, Session>;

  private constructor() {
    this._sessions = new Map();
  }

  public static getInstance(): SessionsService {
    if (!SessionsService.instance) {
      SessionsService.instance = new SessionsService();
    }

    return SessionsService.instance;
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

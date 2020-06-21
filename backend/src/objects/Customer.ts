import { SocketID, SessionID } from "../utils/types";
import SessionsStore from "../singletons/SessionsStore";
import { FirebaseUser } from "../singletons/ConnectedPlayers";

/**
 * Represents logged in customer with attached firebase user uid
 */
export default class Customer {
  private userUID: FirebaseUser["uid"];
  public socketID: SocketID;
  public sessionID: SessionID | null;
  // public isReady: boolean;

  constructor(socketID, firebaseUser:FirebaseUser) {
    this.socketID = socketID;
    this.sessionID = null;
    this.userUID = firebaseUser?.uid;
    // this.isReady = false;
  }

  get ID() {
    return this.userUID;
  }

  updateSocket(socketID) {
    this.socketID = socketID;
  }

  getSocketID() {
    return this.socketID;
  }

  setSessionID(sessionID) {
    this.sessionID = sessionID;
  }

  getSession() {
    if (this.sessionID) {
      const sessionStore = SessionsStore.getInstance();
      const session = sessionStore.getByID(this.sessionID);
      return session;
    }

    return null;
  }
}
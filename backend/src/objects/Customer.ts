import { SessionID, SocketID } from "../utils/types";

/**
 * Represents logged in customer with attached firebase user uid
 */
export default class Customer {
  // private userUID;
  public socketID: SocketID;
  public isReady: boolean;
  public sessionID: SessionID = '';

  constructor(socketID, firebaseUser?) {
    this.socketID = socketID;

    // if (firebaseUser && firebaseUser.uid) {
    //   this.userUID = firebaseUser.uid;
    // }
    this.isReady = false;
  }

  updateSocket(socketID) {
    this.socketID = socketID;
  }

  getSocket() {
    return this.socketID;
  }

  setReady(ready) {
    this.isReady = ready;
  }

  setToSession(sessionID) {
    this.sessionID = sessionID;
  }
}
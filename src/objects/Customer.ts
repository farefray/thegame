import { SocketID } from "../models/ConnectedPlayers";

/**
 * Represents logged in customer with attached firebase user uid
 */
export default class Customer {
  // private userUID;
  public socketID: SocketID;

  constructor(socketID, firebaseUser?) {
    this.socketID = socketID;

    // if (firebaseUser && firebaseUser.uid) {
    //   this.userUID = firebaseUser.uid;
    // }
  }

  updateSocket(socketID) {
    this.socketID = socketID;
  }

  getSocket() {
    return this.socketID;
  }
}
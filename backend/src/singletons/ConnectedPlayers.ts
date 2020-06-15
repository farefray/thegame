import Customer from "../objects/Customer";
import { SocketID } from "../utils/types";

export type FirebaseUser = {
  uid: string;
}


/**
 * Instance for storing connected players and their sessions.
 * Also includes helper methods which are supposed to make easier data extracting and workout
 */
export default class ConnectedPlayers {
  private static instance: ConnectedPlayers;

  /** Map which is storing relationship between connected firebase userids and Customers */
  private _connectedPlayers: Map<FirebaseUser["uid"], Customer>;
  /** Map stores relationship between socketIds and firebase connected users */
  private _socketsMap: Map<SocketID, FirebaseUser["uid"]>;

  private constructor() {
    this._connectedPlayers = new Map();
    this._socketsMap = new Map();
  }

  public static getInstance(): ConnectedPlayers {
    if (!ConnectedPlayers.instance) {
      ConnectedPlayers.instance = new ConnectedPlayers();
    }

    return ConnectedPlayers.instance;
  }

  // todo Maybe if customer has already session and game, we need to update his state and restore session?
  public login(firebaseUser: FirebaseUser, socketID: SocketID) {
    // reconnection
    if (this._connectedPlayers.has(firebaseUser.uid)) {
      const customer = this._connectedPlayers.get(firebaseUser.uid);

      if (customer) {
        this.updateSockets(customer.getSocket(), socketID);
        customer.updateSocket(socketID);
        return customer;
      }
    }

    const customer = new Customer(socketID);
    this._connectedPlayers.set(firebaseUser.uid, customer);
    this._socketsMap.set(socketID, firebaseUser.uid);
    return customer;
  }

  private updateSockets(oldSocket, newSocket) {
    const old = this._socketsMap.get(oldSocket);
    if (old) {
      this._socketsMap.delete(oldSocket);
      this._socketsMap.set(newSocket, old)
    }
  }

  public disconnect(socketID: SocketID) {
    if (this._socketsMap.has(socketID)) {
      const userID = this._socketsMap.get(socketID);

      if (userID) {
        const customer = this._connectedPlayers.get(userID);
        /**
         * user is disconnected, but we shouldnt remove it from _connectedPlayers instantly, as he may reconnect soon.
         * TODO We need to make him and get some garbage collector in order to cleanup
         */
        if (customer) {
          return customer;
        }
      }

      this._socketsMap.delete(socketID);
    }

    return null;
  }

  public getBySocket(socketID: SocketID) {
    const uid = this._socketsMap.get(socketID);
    if (uid) {
      return this._connectedPlayers.get(uid);
    }
  }
}

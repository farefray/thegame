import { v4 as uuidv4 } from 'uuid';
import State from '../structures/State';
import Battle, { BattleBoard, BattleResult } from '../structures/Battle';
import Player from '../structures/Player';
import SessionsService from '../services/Sessions';
import Customer from './Customer';
import { FirebaseUser } from '../services/ConnectedPlayers';
import { ABILITY_PHASE } from '../typings/Card';

const MAX_ROUND = 25;

// TODO consider using https://github.com/expressjs/session#readme for socket.io
export default class Session {
  private _id = uuidv4();
  public state: State;

  constructor(customers: Array<Customer>) {
    this.state = new State(customers);

    customers.forEach(customer => {
      customer.setSessionID(this._id);
    })

    const sessionStore = SessionsService.getInstance();
    sessionStore.store(this);
  }

  getID() {
    return this._id;
  }

  getState() {
    return this.state;
  }

  updateState(newState) {
    this.state = newState;
  }

  hasNextRound() {
    return Object.keys(this.state.getPlayersArray()).length > 1 && this.state.getRound() < MAX_ROUND;
  }

  disconnect(clientID) {
    // todo
    // if (this.clients.includes(clientID)) {
    //   this.clients = this.clients.filter((index) => index !== clientID);
    // }
  }

}

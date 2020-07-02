import { v4 as uuidv4 } from 'uuid';
import State from '../structures/State';
import SessionsService from '../services/Sessions';
import Customer from './Customer';



const sessionStore = SessionsService.getInstance();

// TODO consider using https://github.com/expressjs/session#readme for socket.io
export default class Session {
  private _id = uuidv4();
  public state: State;

  constructor(customers: Array<Customer>) {
    this.state = new State(customers);

    customers.forEach(customer => {
      customer.setSessionID(this._id);
    })

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



  disconnect(clientID) {
    // todo
    // if (this.clients.includes(clientID)) {
    //   this.clients = this.clients.filter((index) => index !== clientID);
    // }
  }

}

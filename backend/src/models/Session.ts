import { v4 as uuidv4 } from 'uuid';
import State from '../structures/State';
import Battle, { BattleBoard, BattleResult } from '../structures/Battle';
import Player from '../structures/Player';
import SessionsService from '../services/Sessions';
import Customer from './Customer';
import { FirebaseUser } from '../services/ConnectedPlayers';

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

  async nextRound() {
    const state = this.getState();
    const players = state.getPlayersArray();

    if (players.length === 2) { // ? todo can be different or what?
      // players[0].beforeBattle(players[1]);
      // players[1].beforeBattle(players[0]);

      const firstPlayer = players[0];
      const secondPlayer = players[1];

      players.forEach((player) => {
        player.dealCards();
      })

      state.playCards();

      const battleBoards: Array<BattleBoard> = [];
      battleBoards.push({
        owner: players[0].getUID(),
        units: players[0].board.units()
      });

      battleBoards.push({
        owner: players[1].getUID(),
        units: players[1].board.reverse().units()
      });

      const battle = new Battle(battleBoards, [players[0].getUID(), players[1].getUID()]);
      await battle.proceedBattle();
      // if (battleResult.battleTime > playersBattleResults.roundCountdown) {
      //   playersBattleResults.roundCountdown = battleResult.battleTime;
      // }

      return true;
    }

    return false;
  }

  disconnect(clientID) {
    // todo
    // if (this.clients.includes(clientID)) {
    //   this.clients = this.clients.filter((index) => index !== clientID);
    // }
  }

}

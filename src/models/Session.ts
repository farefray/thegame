import { v4 as uuidv4 } from 'uuid';
import State from '../structures/State';
import Battle, { BattleBoard, BattleResult } from '../structures/Battle';
import Player from '../structures/Player';
import SessionsService from '../services/Sessions';
import Customer from './Customer';

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
    return Object.keys(this.state.getPlayers()).length > 1 && this.state.getRound() < MAX_ROUND;
  }

  getPlayerPairs() {
    return Object.keys(this.state.players).reduce((result: Array<Array<string>>, value, index, array: Array<string>) => {
      if (index % 2 === 0) {
        result.push(array.slice(index, index + 2));
      }

      return result;
    }, []);
  }

  async nextRound() {
    // process with battles
    const playersBattleResults: {
      roundCountdown: number;
      battles: Array<BattleResult>;
      winners: Array<string>;
    } = {
      roundCountdown: Number.MIN_VALUE,
      battles: [],
      winners: []
    };

    const playersPairs = this.getPlayerPairs();
    for (const playerPair of playersPairs) {
      const battleBoards: Array<BattleBoard> = [];
      for (const uid of playerPair) {
        const player: Player = this.state.players[uid];
        const opponentUID: string = playerPair.filter((v) => v !== uid).shift() || '';
        const opponentPlayer: Player = this.state.players[opponentUID];
        player.beforeBattle(opponentPlayer);

        // now we need to reverse second player board in order for it to appear properly
        const battleBoard: BattleBoard = {
          owner: player.getUID(),
          units: uid === playerPair[1] ? player.board.reverse().units() : player.board.units()
        };

        battleBoards.push(battleBoard);
      }

      const battle = new Battle(battleBoards);
      const battleResult = await battle.proceedBattle();
      if (battleResult.battleTime > playersBattleResults.roundCountdown) {
        playersBattleResults.roundCountdown = battleResult.battleTime;
      }

      playersBattleResults.winners.push(battleResult.winner);
      playersBattleResults.battles.push(battleResult);
    }

    return playersBattleResults;
  }

  disconnect(clientID) {
    // todo
    // if (this.clients.includes(clientID)) {
    //   this.clients = this.clients.filter((index) => index !== clientID);
    // }
  }

}

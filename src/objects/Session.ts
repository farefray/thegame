import State from "./State";
import BattleController from "../controllers/BattleController";
import { BattleBoard, BattleResult } from "./Battle";

const uuidv1 = require('uuid/v1');

const MAX_ROUND = 5;


export default class Session {
  private _id = uuidv1();
  private clients: Array<String>;
  public state: State;

  constructor (clients) {
    this.state = new State(clients);
    this.clients = this.state.clients; // was connectedPlayers, so handle this in case
  }

  get ID() {
    return this._id;
  }

  getState() {
    return this.state;
  }

  hasNextRound() {
    return Object.keys(this.state.get('players')).length > 1 && this.state.get('round') < MAX_ROUND;
  }

  async nextRound() {
    const playersPairs = Object.keys(this.state.players).reduce(function(result: Array<Array<string>>, value, index, array: Array<string>) {
      if (index % 2 === 0) {
        result.push(array.slice(index, index + 2));
      }

      return result;
    }, []);

    const playersBattleResults: {
      countdown: number,
      battleResults: Array<BattleResult>
    } = {
      countdown: Number.MIN_VALUE,
      battleResults: []
    };

    for (let playerPair of playersPairs) {
      const battleBoard: Array<BattleBoard> = [];
      for (const uid of playerPair) {
        const player = this.state.players[uid];
        player.beforeBattle();

        battleBoard.push({
          owner: player.index,
          units: player.board
        })
      }

      const battleResult = await BattleController.setupBattle({ boards: battleBoard});
      if (battleResult.battleTime > playersBattleResults.countdown) {
        playersBattleResults.countdown = battleResult.battleTime;
      }

      playersBattleResults.battleResults.push(battleResult);
    }

    return playersBattleResults;
  }

  disconnect(clientID) {
    if (this.clients.includes(clientID)) {
      this.clients = this.clients.filter(index => index !== clientID);
    }
  }

  hasClients() {
    return this.clients.length > 0;
  }
}

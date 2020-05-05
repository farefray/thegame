import { v4 as uuidv4 } from 'uuid';
import State from './State';
import BattleController from '../services/BattleController';
import { BattleBoard, BattleResult } from './Battle';
import Player from './Player';

const MAX_ROUND = 5;

export default class Session {
  private _id = uuidv4();
  public clients: Array<String>; // reivew
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

  updateState(newState) {
    this.state = newState;
  }

  hasNextRound() {
    return Object.keys(this.state.get('players')).length > 1 && this.state.get('round') < MAX_ROUND;
  }

  async nextRound() {
    // form player pairs
    const playersPairs = Object.keys(this.state.players).reduce((result: Array<Array<string>>, value, index, array: Array<string>) => {
      if (index % 2 === 0) {
        result.push(array.slice(index, index + 2));
      }

      return result;
    }, []);

    // process with battles
    const playersBattleResults: {
      countdown: number,
      battles: Array<BattleResult>,
      winners: Array<string>,
    } = {
      countdown: Number.MIN_VALUE,
      battles: [],
      winners:[],
    };

    for (const playerPair of playersPairs) {
      const battleBoard: Array<BattleBoard> = [];
      for (const uid of playerPair) {
        const player: Player = this.state.players[uid];
        const opponentUID: string = (playerPair.filter(v => v !== uid).shift()) || '';
        const opponentPlayer: Player = this.state.players[opponentUID];
        player.beforeBattle(opponentPlayer);

        battleBoard.push({
          owner: player.index,
          units: player.board.units(),
        });
      }

      const battleResult = await BattleController.setupBattle({ boards: battleBoard });
      if (battleResult.battleTime > playersBattleResults.countdown) {
        playersBattleResults.countdown = battleResult.battleTime;
      }

      playersBattleResults.winners.push(battleResult.winner);
      playersBattleResults.battles.push(battleResult);
    }

    this.state.endRound(playersBattleResults.winners);
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

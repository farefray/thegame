import { v4 as uuidv4 } from 'uuid';
import State from './State';
import Battle, { BattleBoard, BattleResult } from './Battle';
import Player from './Player';
import SessionsStore from '../singletons/SessionsStore';
import { SocketID } from '../utils/types';

const MAX_ROUND = 25;

export default class Session {
  private _id = uuidv4();
  public state: State;

  constructor(clients: Array<SocketID>) {
    this.state = new State(clients);

    const sessionStore = SessionsStore.getInstance();
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
      countdown: number;
      battles: Array<BattleResult>;
      winners: Array<string>;
    } = {
      countdown: Number.MIN_VALUE,
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
          owner: player.index,
          units: uid === playerPair[1] ? player.board.reverse().units() : player.board.units()
        };

        battleBoards.push(battleBoard);
      }

      const battle = new Battle(battleBoards);
      const battleResult = await battle.proceedBattle();
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
    // todo
    // if (this.clients.includes(clientID)) {
    //   this.clients = this.clients.filter((index) => index !== clientID);
    // }
  }

  hasClients() {
    return this.state.clients.length > 0;
  }
}

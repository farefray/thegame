import { promisify } from 'util'
import MutableObject from '../abstract/MutableObject';
import { BattleResult } from '../objects/Battle';

const sleep = promisify(setTimeout);
const { STATE } = require('../../../frontend/src/shared/constants.js');
const MAX_ROUND_FOR_INCOME_INC = 5;

export default class State extends MutableObject {
  public round: number;
  public incomeBase: number;
  public amountOfPlayers: number;
  public countdown: number;
  public players: any;

  constructor(playersArray) {
    super();

    this.round = 1;
    this.incomeBase = 1;
    this.amountOfPlayers = playersArray.length;
    this.countdown = STATE.COUNTDOWN_BETWEEN_ROUNDS;

    const playersObject = {};
    playersArray.forEach(player => {
      playersObject[player.index] = player;
    });

    this.players = playersObject;
  }

  endRound(playersBattleResults: Array<BattleResult>) {
    if (this.round <= MAX_ROUND_FOR_INCOME_INC) {
      this.incomeBase = this.incomeBase + 1;
    }
  
    this.round = this.round + 1;
  
    for (const uid in this.players) {
      const gold: number = this.getIn(['players', uid, 'gold']);
      const bonusGold: number = Math.min(Math.floor(gold / 10), 5);
      this.setIn(['players', uid, 'gold'], (gold + this.incomeBase + bonusGold));

      const playerBattle = playersBattleResults[uid];
      if (playerBattle.winner !== uid) {
        // player lost battle, remove health
        const newHealth: number = (this.getIn(['players', uid, 'health']) - this.round);
        this.setIn(['players', uid, 'health'], newHealth);
      }
    }
  }

  dropPlayer(playerID) {
    for (const uid in this.players) {
      if (uid === playerID) {
        delete this.players[uid];
        this.amountOfPlayers -= 1;
      }
    }
  }

  async roundEnd(battleResult: Array<BattleResult>, countdown: number) {
    await sleep(countdown);

    this.endRound(battleResult);
    this.countdown = STATE.COUNTDOWN_BETWEEN_ROUNDS;
  }

  async scheduleNextRound() {
    await sleep(this.countdown);
    return true;
  }
}

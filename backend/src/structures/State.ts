import { promisify } from 'util';
import Player from './Player';
import AiPlayer from './AiPlayer';
import Customer from '../models/Customer';
import { FirebaseUser } from '../services/ConnectedPlayers';

const sleep = promisify(setTimeout);
const { STATE } = require('../shared/constants');
const MAX_ROUND_FOR_INCOME_INC = 5;
const MAX_LEVEL = 8;

export default class State {
  private incomeBase: number;
  private amountOfPlayers: number;
  private countdown = STATE.COUNTDOWN_BETWEEN_ROUNDS;
  private round: number = 1;
  private players: Map<FirebaseUser["uid"], Player>;

  constructor(customers: Array<Customer>) {
    this.round = 1;
    this.incomeBase = 1;
    this.amountOfPlayers = customers.length;
    this.countdown = STATE.COUNTDOWN_BETWEEN_ROUNDS;

    this.players = new Map(customers.map(customer => [customer.ID, new Player(customer.ID)]));

    if (this.players.size % 2 > 0) {
      this.players.set('ai_player', new AiPlayer('ai_player'));
    }
  }

  refreshShopForPlayers() {
    this.players.forEach((player) => {
      player.refreshShop();
    });
  }

  endRound(winners) {
    this.countdown = STATE.COUNTDOWN_BETWEEN_ROUNDS;
    if (this.round <= MAX_ROUND_FOR_INCOME_INC) {
      this.incomeBase = this.incomeBase + 1;
    }

    this.round = this.round + 1;

    for (const uid in this.players) {
      // todo FOR REWORK!!
      const gold: number = this.players[uid].gold;
      const bonusGold: number = Math.min(Math.floor(gold / 10), 5);
      this.players[uid].gold = gold + this.incomeBase + bonusGold;

      if (this.round <= MAX_LEVEL) {
        this.players[uid].level = this.round;
      }

      if (!winners.includes(uid)) {
        // player lost battle, remove health
        const newHealth: number = this.players[uid].health - this.round;
        this.players[uid].health = newHealth;

        if (newHealth < 1) {
          this.dropPlayer(uid); // todo death/lose
        }
      }
    }

    this.refreshShopForPlayers();
  }

  dropPlayer(playerID) {
    for (const [uid, player] of this.players) {
      if (uid === playerID) {
        delete this.players[uid];
        this.amountOfPlayers -= 1;
      }
    }
  }

  async waitUntilNextRound() {
    await sleep(this.countdown);
  }

  async wait(time) {
    await sleep(time);
  }

  getPlayer(playerUID): Player|undefined {
    return this.players.get(playerUID);
  }

  /**
   * Prepare only data which is required for socket transfer
   */
  toSocket() {
    return {
      round: this.round,
      countdown: this.countdown,
      players: [...this.players.values()].map(player => ({
        uid: player.getUID(),
        level: player.level,
        health: player.health
      }))
    };
  }

  getRound() {
    return this.round;
  }

  getPlayers() {
    return this.players;
  }

  getPlayersArray() {
    return [...this.players.values()];
  }

  syncPlayers() {
    this.players.forEach((player) => {
      if (!player.isSynced()) {
        player.update(true);
      }
    });
  }

}

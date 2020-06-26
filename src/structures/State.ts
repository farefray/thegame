import { promisify } from 'util';
import Player from './Player';
import AiPlayer from './AiPlayer';
import Customer from '../models/Customer';
import { FirebaseUser } from '../services/ConnectedPlayers';
import Merchantry from './Merchantry';
import { EventBusUpdater } from './abstract/EventBusUpdater';
import { EVENTBUS_MESSAGE_TYPE } from '../typings/EventBus';

const sleep = promisify(setTimeout);
const { STATE } = require('../shared/constants');
const MAX_ROUND_FOR_INCOME_INC = 5;
const MAX_LEVEL = 8;

export default class State extends EventBusUpdater {
  private incomeBase: number;
  private amountOfPlayers: number;
  private countdown = STATE.COUNTDOWN_BETWEEN_ROUNDS; // todo move somewhere
  private round: number = 1;
  private players: Map<FirebaseUser["uid"], Player>;
  private merchantry: Merchantry;

  constructor(customers: Array<Customer>) {
    super(EVENTBUS_MESSAGE_TYPE.STATE_UPDATE,
      customers.reduce((recipients: Array<FirebaseUser['uid']>, customer) => {
        recipients.push(customer.ID);
        return recipients;
    }, []));

    this.round = 1;
    this.incomeBase = 1;
    this.amountOfPlayers = customers.length;
    this.countdown = STATE.COUNTDOWN_BETWEEN_ROUNDS;

    this.players = new Map(customers.map(customer => [customer.ID, new Player(customer.ID)]));

    // TODO P0
    // if (this.players.size % 2 > 0) {
    //   this.players.set('ai_player', new AiPlayer('ai_player'));
    // }

    this.merchantry = new Merchantry(this.players.values());

    this.invalidate(true);
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

    this.invalidate(true);
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
      })),
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
        player.invalidate(true);
      }
    });
  }

}

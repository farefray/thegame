import { promisify } from 'util';
import Player from './Player';
import AiPlayer from './AiPlayer';
import AppError from './AppError';

const sleep = promisify(setTimeout);
const { STATE } = require('../shared/constants');
const MAX_ROUND_FOR_INCOME_INC = 5;
const PLAYERS_MINIMUM = 2;
const MAX_LEVEL = 8;

export default class State {
  public round: number;
  public incomeBase: number;
  public amountOfPlayers: number;
  public countdown = STATE.COUNTDOWN_BETWEEN_ROUNDS;
  public players = {};
  public clients: Array<String>;

  constructor(clients) {
    this.clients = clients;
    this.round = 1;
    this.incomeBase = 1;
    this.amountOfPlayers = clients.length;
    this.countdown = STATE.COUNTDOWN_BETWEEN_ROUNDS;

    const players: Array<Player|AiPlayer> = [];
    // create players
    clients.forEach(index => {
      players.push(new Player(index));
    });

    // we need to have pairs, so fill rest of spots as AI
    while (players.length < PLAYERS_MINIMUM || players.length % 2 > 0) {
      players.push(new AiPlayer(`ai_player_${players.length}`));
    }

    // this is dirty
    for (let index = 0; index < players.length; index++) {
      const playerEntity = players[index];
      this.players[playerEntity.index] = playerEntity;
    }

    this.refreshShopForPlayers();
  }

  refreshShopForPlayers() {
    for (const index in this.players) {
      this.players[index].refreshShop();
    }
  }

  endRound(winners) {
    this.countdown = STATE.COUNTDOWN_BETWEEN_ROUNDS;
    if (this.round <= MAX_ROUND_FOR_INCOME_INC) {
      this.incomeBase = this.incomeBase + 1;
    }

    this.round = this.round + 1;

    for (const uid in this.players) {
      // FOR REWORK!!
      const gold: number = this.players[uid].gold;
      const bonusGold: number = Math.min(Math.floor(gold / 10), 5);
      this.players[uid].gold = (gold + this.incomeBase + bonusGold);

      if (this.round <= MAX_LEVEL) {
        this.players[uid].level = this.round;
      }

      if (!winners.includes(uid)) {
        // player lost battle, remove health
        const newHealth: number = (this.players[uid].health - this.round);
        this.players[uid].health = newHealth;

        if (newHealth < 1) {
          this.dropPlayer(uid);
        }
      }
    }

    this.refreshShopForPlayers();
  }

  dropPlayer(playerID) {
    for (const uid in this.players) {
      if (uid === playerID) {
        delete this.players[uid];
        this.amountOfPlayers -= 1;
      }
    }
  }

  async scheduleNextRound() {
    await sleep(this.countdown);
  }

  async wait(time) {
    await sleep(time);
  }

  getPlayer(playerIndex): Player {
    return this.players[playerIndex];
  }

  /**
   * Prepare only data which is required for socket transfer
   * ! TODO
   */
  toSocket() {
    const dataToSend = JSON.parse(JSON.stringify(this));
    dataToSend.players = this.getPlayers().map((player) => {
      // TODO \/ this supposed to be send on update_player, not on state sending
      return {
        index: player.index,
        level: player.level,
        health: player.health,
        hand: player.hand.toJSON(),
        board: player.board.toJSON(),
        shopUnits: player.shopUnits.toJSON(),
        gold: player.gold
      };
    })

    return dataToSend;
  }

  getRound() {
    return this.round;
  }

  getPlayers(): Array<Player|AiPlayer> {
    return Object.values(this.players);
  }
}

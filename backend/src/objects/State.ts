import { promisify } from 'util'
import MutableObject from '../abstract/MutableObject';
import Player from './Player';
import AiPlayer from './AiPlayer';
import Monsters from '../utils/Monsters';
import AppError from './AppError';

const sleep = promisify(setTimeout);
const { STATE } = require('../../../frontend/src/shared/constants.js');
const MAX_ROUND_FOR_INCOME_INC = 5;
const PLAYERS_MINIMUM = 2;
const SHOP_UNITS = 4;
const HAND_UNITS_LIMIT = 9;

export default class State extends MutableObject {
  public round: number;
  public incomeBase: number;
  public amountOfPlayers: number;
  public countdown = STATE.COUNTDOWN_BETWEEN_ROUNDS;
  public players = {};
  public clients: Array<String>;

  constructor(clients) {
    super();

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

    this.refreshShopForPlayers()
  }

  refreshShopForPlayers() {
    for (const playerIndex in this.players) {
      for (let i = 0; i <= SHOP_UNITS; i++) {
        this.setIn(['players', playerIndex, 'shopUnits', i], Monsters.getRandomUnit({
          cost: this.get('round')
        }));
      }
    }
  }

  endRound(winners) {
    this.countdown = STATE.COUNTDOWN_BETWEEN_ROUNDS;
    if (this.round <= MAX_ROUND_FOR_INCOME_INC) {
      this.incomeBase = this.incomeBase + 1;
    }

    this.round = this.round + 1;

    for (const uid in this.players) {
      const gold: number = this.getIn(['players', uid, 'gold']);
      const bonusGold: number = Math.min(Math.floor(gold / 10), 5);
      this.setIn(['players', uid, 'gold'], (gold + this.incomeBase + bonusGold));

      if (!winners.includes(uid)) {
        // player lost battle, remove health
        const newHealth: number = (this.getIn(['players', uid, 'health']) - this.round);
        this.setIn(['players', uid, 'health'], newHealth);

        if (newHealth < 1) {
          this.dropPlayer(uid)
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

  purchasePawn(playerIndex, pieceIndex): Boolean|AppError {
    const player: Player = this.getIn(['players', playerIndex]);
    if (player.isDead()) {
      return new AppError('warning', "Sorry, you're already dead");
    }

    /**
     * Checks to be done:
     * unit exist in shop
     * hand is not full
     * can afford
     */
    const unit = player.shopUnits[pieceIndex];
    if (!unit || Object.keys(player.hand).length >= HAND_UNITS_LIMIT) {
      return new AppError('warning', 'Your hand is full');
    }

    if (player.gold < unit.cost) {
      return new AppError('warning', 'Not enough money');
    }

    /**
     * remove unit from shop
     * add unit to hand
     * remove gold
     * set player state
     */
    player.addToHand(unit.name);
    delete player.shopUnits[pieceIndex];
    player.gold -= unit.cost;

    this.setIn(['players', playerIndex], player);
    return true;
  }
}

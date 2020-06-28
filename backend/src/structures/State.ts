import { promisify } from 'util';
import Player from './Player';
import AiPlayer from './AiPlayer';
import Customer from '../models/Customer';
import { FirebaseUser } from '../services/ConnectedPlayers';
import Merchantry from './Merchantry';
import { EventBusUpdater } from './abstract/EventBusUpdater';
import { EVENTBUS_MESSAGE_TYPE } from '../typings/EventBus';
import { ABILITY_PHASE } from '../typings/Card';
import Card from './Card';

const sleep = promisify(setTimeout);
const { STATE } = require('../shared/constants');
const MAX_ROUND_FOR_INCOME_INC = 5;
const MAX_LEVEL = 8;

export default class State extends EventBusUpdater {
  private incomeBase: number;
  private amountOfPlayers: number;
  private countdown = STATE.COUNTDOWN_BETWEEN_ROUNDS; // todo move somewhere
  private round: number = 1;
  private players: Map<FirebaseUser['uid'], Player>;
  private merchantry: Merchantry;

  constructor(customers: Array<Customer>) {
    super(
      EVENTBUS_MESSAGE_TYPE.STATE_UPDATE,
      customers.reduce((recipients: Array<FirebaseUser['uid']>, customer) => {
        recipients.push(customer.ID);
        return recipients;
      }, [])
    );

    this.round = 1;
    this.incomeBase = 1;
    this.amountOfPlayers = customers.length;
    this.countdown = STATE.COUNTDOWN_BETWEEN_ROUNDS;

    this.players = new Map(customers.map((customer) => [customer.ID, new Player(customer.ID)]));

    // TODO P0
    // if (this.players.size % 2 > 0) {
    //   this.players.set('ai_player', new AiPlayer('ai_player'));
    // }

    this.merchantry = new Merchantry(this.players.values());

    this.invalidate();
  }

  playCards(phase: ABILITY_PHASE = ABILITY_PHASE.INSTANT) {
    for (const card of this.firstPlayer.hand.values()) {
      card.applyAbilities(this.firstPlayer, this.secondPlayer, phase);
    }

    for (const card of this.secondPlayer.hand.values()) {
      card.applyAbilities(this.secondPlayer, this.firstPlayer, phase);
    }
  }

  endRound(winners?) {
    // todo
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

      if (winners && !winners.includes(uid)) {
        // player lost battle, remove health
        const newHealth: number = this.players[uid].health - this.round;
        this.players[uid].health = newHealth;

        if (newHealth < 1) {
          this.dropPlayer(uid); // todo death/lose
        }
      }
    }

    this.invalidate();
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

  getPlayer(playerUID) {
    return this.players.get(playerUID);
  }

  /** TODO FirebaseUser['uid'] to be some easier type */
  purchaseCard(playerUID: FirebaseUser['uid'], cardIndex: number) {
    /**
     * TODO Phase2, auction for cards?
     */
    const revealedCards = this.merchantry.getRevealedCards();
    const player = this.getPlayer(playerUID);
    if (player) {
      if (player.gold < revealedCards.get(cardIndex).cost) {
        //  todo new AppError('warning', 'Not enough money');
        return false;
      }

      player.addToDiscard(revealedCards.eject(cardIndex));
    }

    return true;
  }

  getRound() {
    return this.round;
  }

  get firstPlayer(): Player {
    return [...this.players.values()][0];
  }

  get secondPlayer(): Player {
    return [...this.players.values()][1];
  }

  getPlayers() {
    return this.players;
  }

  getPlayersArray() {
    return [...this.players.values()];
  }

  // TODO
  syncPlayers() {
    this.players.forEach((player) => {
      if (!player.isSynced()) {
        player.invalidate();
      }
    });
  }

  toSocket() {
    return {
      round: this.round,
      countdown: this.countdown,
      players: [...this.players.values()].map((player) => ({
        uid: player.getUID(),
        health: player.health
      }))
    };
  }
}

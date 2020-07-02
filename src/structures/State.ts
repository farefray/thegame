import Player from './Player';
import AiPlayer from './AiPlayer';
import Customer from '../models/Customer';
import Merchantry from './Merchantry';
import { EventBusUpdater } from './abstract/EventBusUpdater';
import { EVENT_TYPE } from '../typings/EventBus';
import { ABILITY_PHASE, CARD_TYPES } from '../typings/Card';
import { FirebaseUserUID } from '../utils/types';

export default class State extends EventBusUpdater {
  MAX_ROUND = 25;

  private amountOfPlayers: number; // todo
  private round: number = 1;
  private players: Map<FirebaseUserUID, Player>;
  private merchantry: Merchantry;

  constructor(customers: Array<Customer>) {
    super(
      EVENT_TYPE.STATE_UPDATE,
      customers.reduce((recipients: Array<FirebaseUserUID>, customer) => {
        recipients.push(customer.ID);
        return recipients;
      }, [])
    );

    this.round = 1;
    this.amountOfPlayers = customers.length;

    this.players = new Map(customers.map((customer) => [customer.ID, new Player(customer.ID)]));

    if (this.players.size === 1) {
      this.players.set('ai_player', new AiPlayer('ai_player'));
    }

    this.merchantry = new Merchantry(this.players.values());

    this.invalidate();
  }

  getMerchantry() {
    return this.merchantry;
  }

  playCards(phase: ABILITY_PHASE = ABILITY_PHASE.INSTANT, victoryUserUID?: FirebaseUserUID) {
    this.players.forEach((player) => {
      const opponent = this.getPlayersArray().filter(p => p.getUID() !== player.getUID())[0];

      const cards = [...player.hand.values()];
      if (phase !== ABILITY_PHASE.VICTORY || player.getUID() === victoryUserUID) {
        for (const card of cards) {
          card.applyAbilities(player, opponent, phase);
        }
      }

      for (let index = 0; index < cards.length; index++) {
        const card = cards[index];
        if (phase === ABILITY_PHASE.INSTANT && card.type === CARD_TYPES.CARD_MONSTER) {
          player.addToBoard(card);
        } else {
          player.moveToDiscard(card);
        }
      }

      if (phase === ABILITY_PHASE.VICTORY) {
        player.board.empty();
      }

      player.invalidate(); // todo every card should be emitted separately to handle effects
    });
  }

  dropPlayer(playerID) { // todo
    for (const [uid, player] of this.players) {
      if (uid === playerID) {
        delete this.players[uid];
        this.amountOfPlayers -= 1;
      }
    }
  }

  getPlayer(playerUID) {
    return this.players.get(playerUID);
  }

  purchaseCard(playerUID: FirebaseUserUID, cardIndex: number) {
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

      const ejectedCard = revealedCards.eject(cardIndex);
      player.cardPurchase(ejectedCard);
      this.merchantry.revealCards();
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

  /**
   * performs full state sending. Executed on costruct and on reconnect
   */
  toSocket() {
    return {
      // TODO
    };
  }
}

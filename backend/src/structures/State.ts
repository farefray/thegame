import Player from './Player';
import AiPlayer from './AiPlayer';
import Customer from '../models/Customer';
import Merchantry from './Merchantry';
import { ABILITY_PHASE, CARD_TYPES, EFFECT_TYPE } from '../typings/Card';
import { UserUID } from '../utils/types';
import { CardAction } from './Card/CardAction';
import { asyncForEach, waitFor } from '../utils/async';

export default class State {
  MAX_ROUND = 25;

  private round: number = 1;
  private players: Map<UserUID, Player>;
  private merchantry: Merchantry;

  constructor(customers: Array<Customer>) {
    const subscribers = customers.reduce((recipients: Array<UserUID>, customer) => {
      recipients.push(customer.ID);
      return recipients;
    }, []);

    this.round = 1;

    this.players = new Map(customers.map(
      (customer) => [
        customer.ID,
        new Player(customer.ID, subscribers)
      ]
    ));

    if (this.players.size === 1) {
      this.players.set('ai_player', new AiPlayer('ai_player', subscribers)); // TODO send AI state to player on game start
    }

    this.merchantry = new Merchantry(this.players.values());
  }

  getMerchantry() {
    return this.merchantry;
  }

  async playCards(phase: ABILITY_PHASE = ABILITY_PHASE.INSTANT, victoryUserUID?: UserUID) {
    const cardActions: CardAction[] = [];
    this.players.forEach((player) => {
      const opponent = this.getPlayersArray().filter((p) => p.getUID() !== player.getUID())[0];

      const cards = [...player.hand.values()];
      for (const card of cards) {
        cardActions.push(card.getCardAction(player, opponent, phase, victoryUserUID));
      }
    });

    await asyncForEach(cardActions, async (cardAction) => {
      this.executeCardAction(cardAction, phase)
      await waitFor(1000);
    });

    if (phase === ABILITY_PHASE.VICTORY) {
      this.players.forEach((player) => {
        player.board.empty(); // we actually dont need board. Only battle board matters.
        // player.invalidate(); // this maybe needed to sync FE with BE, but would be just great to have it ommited
      });
    }

    return true;
  }

  /**
   * ? Such approach is tricky as we need to keep consistency between Card action generation, executing card on backend and executing card on frontend.
   * Maybe need to get some better way.
   */
  executeCardAction(cardAction: CardAction, phase) {
    const owner = this.getPlayer(cardAction.owner);
    if (!owner) {
      throw new Error('Trying to execute card without owner');
    }

    if (cardAction.effects.length) {
      cardAction.effects.forEach((effect) => {
        switch (effect.type) {
          case EFFECT_TYPE.GOLD: {
            owner.gold += effect.payload;
            break;
          }

          case EFFECT_TYPE.HEAL: {
            owner.health += effect.payload;
            break;
          }

          case EFFECT_TYPE.DAMAGE: {
            // bad way >..<
            this.players.forEach((player) => {
              if (player.getUID() !== cardAction.owner) {
                player.health -= effect.payload;
              }
            });

            break;
          }

          default: {}
        }
      });
    }

    // todo not mosnter cards with victory phase abilityies

    if (phase === ABILITY_PHASE.INSTANT && cardAction.type === CARD_TYPES.CARD_MONSTER) {
      owner.addToBoard(cardAction);
    } else if (cardAction.isDone) {
      owner.moveToDiscard(cardAction);
    }

    cardAction.invalidate();
  }

  dropPlayer(playerID) {
    // todo
    for (const [uid, player] of this.players) {
      if (uid === playerID) {
        delete this.players[uid];
      }
    }
  }

  getPlayer(playerUID) {
    return this.players.get(playerUID);
  }

  purchaseCard(playerUID: UserUID, cardIndex: number) {
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

  nextRound() {
    this.round += 1;
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
}

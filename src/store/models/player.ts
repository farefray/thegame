import { thunk, action, Action, Thunk } from 'easy-peasy';
import { Card, CardAction } from '@/types/Card';

export interface PlayerModel {
  uuid: string;
  setUUID: Action<PlayerModel, string>;

  health: number;
  changeHealth: Action<PlayerModel, number>;

  gold: number;
  changeGold: Action<PlayerModel, number>;

  board: [];
  setBoard: Action<PlayerModel, any>;

  hand: Array<Card>;
  handCardToDiscard: Action<PlayerModel, string>;
  playCard: Thunk<PlayerModel, any>;

  deckSize: number;
  discard: Card[];

  updatePlayer: Thunk<PlayerModel, any>;
  setPlayer: Action<PlayerModel, any>;
}

const playerModel: PlayerModel = {
  uuid: '',
  setUUID: action((state, uuid) => {
    state.uuid = uuid;
  }),

  health: 50,
  changeHealth: action((state, amount) => {
    state.health += amount;
  }),

  gold: 0,
  changeGold: action((state, amount) => {
    state.gold += amount;
  }),

  board: [],
  setBoard: action((state, payload) => {
    state.board = payload;
  }),

  hand: [],

  handCardToDiscard: action((state, cardUUID) => {
    if (state.hand.length > 0) {
      // we play this card, by moving to discard
      // find cardIndex
      let cardIndex = [...state.hand].findIndex((card) => card.uuid === cardUUID);

      state.discard.push({ ...state.hand[cardIndex] } as Card);
      state.hand.splice(cardIndex, 1);
    }
  }),

  playCard: thunk(async (actions, cardAction: CardAction, { getState }) => {
    const { uuid } = getState();

    if (cardAction.monsterName) {
      // monster effect to board?
    } else {
      actions.handCardToDiscard(cardAction.uuid)
    }


    if (cardAction.effects) {
      console.log("cardAction.effects", cardAction.effects)
      cardAction.effects.forEach(effect => {
        if (cardAction.owner !== uuid) {
          return;
        }

        switch (effect.type) {
          case 'GOLD': {
            actions.changeGold(effect.payload);
            break;
          }

          case 'DAMAGE': {
            // todo
            break;
          }

          case 'HEAL': {
            actions.changeHealth(effect.payload);
            break;
          }
        }
      });
    }

  }),

  deckSize: 0,
  discard: [],

  setPlayer: action((state, payload) => {
    state.health = payload.health || state.health;
    state.gold = payload.gold || state.gold;
    state.board = payload.board || state.board;
    state.hand = payload.hand || state.hand;
    state.deckSize = payload.deckSize || state.deckSize;
    state.discard = payload.discard || state.discard;
  }),

  updatePlayer: thunk((actions, payload) => {
    switch (payload.subtype) {
      case 'PLAYER_CARD_TO_BOARD': {
        actions.setBoard(payload.board);
        break;
      }

      case 'PLAYER_CARDS_DEALED': {
        actions.setPlayer(payload);
        break;
      }

      default: {
        actions.setPlayer(payload);
      }
    }
  })
};

export default playerModel;

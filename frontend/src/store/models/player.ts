import { thunk, action, Action, Thunk } from 'easy-peasy';

export interface PlayerModel {
  health: number;
  gold: number;

  board: [];
  setBoard: Action<PlayerModel, any>;

  hand: [];
  cardAction: object | null; // CardAction @see {backend/typings/Card.ts}
  dispatchCardAction: Action<PlayerModel, any>
  playCard: Thunk<PlayerModel, any>;

  deckSize: number;
  discard: [];

  updatePlayer: Thunk<PlayerModel, any>;
  setPlayer: Action<PlayerModel, any>;
}

const playerModel: PlayerModel = {
  health: 50,
  gold: 0,

  board: [],
  setBoard: action((state, payload) => {
    state.board = payload;
  }),

  hand: [],
  cardAction: null,
  dispatchCardAction: action((state, payload) => {
    state.cardAction = payload;
  }),
  playCard: thunk(async (actions, cardAction) => {
    console.log("cardAction", cardAction)
    actions.dispatchCardAction(cardAction);
    // todo execute changes(hp/gold/etc)
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

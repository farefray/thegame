import { thunk, action, Action, Thunk } from 'easy-peasy';
import { Card, CardAction, ABILITY_PHASE } from '@/types/Card.d.ts';

interface AnyPlayerModel {
  health: number;
  gold: number;
  board: Array<any>;
  hand: Card[];
  deck: Card[]; // not really a card, just a representation with UUID
  discard: Card[];
}

interface PlayerModelPayload {
  isSelf: boolean; // if thats a change to current player or opponent
  isSet?: boolean; // if thats a rewrite instead of update
  payload: any;
}

interface PlayerUpdatePayload extends AnyPlayerModel {
  uuid: string;
}

export interface PlayersModel {
  uuid: string; // current player UUID for frontend
  setCurrentPlayerUUID: Action<PlayersModel, string>;

  currentPlayer: AnyPlayerModel;
  opponent: AnyPlayerModel;

  changeHealth: Action<PlayersModel, PlayerModelPayload>;
  changeGold: Action<PlayersModel, PlayerModelPayload>;

  cardsDealed: Thunk<PlayersModel, PlayerUpdatePayload>;
  cardsUpdate: Action<PlayersModel, PlayerModelPayload>;

  setBoard: Action<PlayersModel, any>;
  handCardToDiscard: Action<PlayersModel, PlayerModelPayload>;
  playCard: Thunk<PlayersModel, CardAction>;
  updatePlayer: Thunk<PlayersModel, PlayerUpdatePayload>;
}

const defaultAnyPlayerState = {
  health: 50,
  gold: 0,
  board: [],
  hand: [],
  deck: [],
  discard: []
};

const playersModel: PlayersModel = {
  uuid: '',
  setCurrentPlayerUUID: action((state, uuid) => {
    state.uuid = uuid;
  }),

  currentPlayer: { ...defaultAnyPlayerState },
  opponent: { ...defaultAnyPlayerState },

  changeHealth: action((state, { payload: amount, isSelf, isSet }) => {
    // bad code style
    if (isSelf) {
      if (isSet) {
        state.currentPlayer.health = amount;
      } else {
        state.currentPlayer.health += amount;
      }
    } else {
      if (isSet) {
        state.opponent.health = amount;
      } else {
        state.opponent.health += amount;
      }
    }
  }),

  changeGold: action((state, { payload: amount, isSelf, isSet }) => {
    if (isSelf) {
      if (isSet) {
        state.currentPlayer.gold = amount;
      } else {
        state.currentPlayer.gold += amount;
      }
    } else {
      if (isSet) {
        state.opponent.gold = amount;
      } else {
        state.opponent.gold += amount;
      }
    }
  }),

  cardsUpdate: action((state, { payload: cards, isSelf }) => {
    if (isSelf) {
      state.currentPlayer.hand = [...cards.hand];
      state.currentPlayer.deck = cards.deck;
      state.currentPlayer.discard = cards.discard;
    } else {
      state.opponent.hand = [...cards.hand];
      state.opponent.deck = cards.deck;
      state.opponent.discard = cards.discard;
    }
  }),

  cardsDealed: thunk((actions, playerModelUpdate, { getState }) => {
    const { uuid } = getState();

    actions.cardsUpdate({
      payload: playerModelUpdate,
      isSelf: playerModelUpdate.uuid === uuid
    });
  }),

  setBoard: action((state, { payload: board, isSelf }) => {
    if (isSelf) {
      state.currentPlayer.board = board;
    } else {
      state.opponent.board = board;
    }
  }),

  handCardToDiscard: action((state, { payload: cardUUID, isSelf }) => {
    const hand = isSelf ? state.currentPlayer.hand : state.opponent.hand;
    const discard = isSelf ? state.currentPlayer.discard : state.opponent.discard;

    if (hand.length > 0) {
      // we play this card, by moving to discard
      let cardIndex = [...hand].findIndex((card) => card.uuid === cardUUID);

      discard.push({ ...hand[cardIndex] } as Card);
      hand.splice(cardIndex, 1);
    }
  }),

  playCard: thunk((actions, cardAction, { getState }) => {
    const { uuid } = getState();

    const isSelf = cardAction.owner === uuid;

    if (cardAction.monsterName && cardAction.phase !== ABILITY_PHASE.VICTORY) {
      // todo monster effect to board?
    } else if (cardAction.isDone) {
      actions.handCardToDiscard({
        payload: cardAction.uuid,
        isSelf
      });
    }

    if (cardAction.effects) {
      cardAction.effects.forEach((effect) => {
        switch (effect.type) {
          case 'GOLD': {
            actions.changeGold({
              payload: effect.payload,
              isSelf,
              isSet: false
            });

            break;
          }

          case 'DAMAGE': {
            actions.changeHealth({
              payload: effect.payload,
              isSelf: !isSelf
            });

            break;
          }

          case 'HEAL': {
            actions.changeHealth({
              payload: effect.payload,
              isSelf: isSelf
            });

            break;
          }
        }
      });
    }
  }),

  updatePlayer: thunk((actions, playerModelUpdate, { getState }) => {
    const { uuid } = getState();

    let isSelf = playerModelUpdate.uuid === uuid;

    if (playerModelUpdate.hand && playerModelUpdate.deck && playerModelUpdate.discard) {
      actions.cardsUpdate({
        payload: {
          hand: [...playerModelUpdate.hand],
          deck: playerModelUpdate.deck,
          discard: playerModelUpdate.discard
        },
        isSelf
      });
    }

    if (playerModelUpdate.board) {
      actions.setBoard({
        payload: [...playerModelUpdate.board],
        isSelf
      });
    }

    if (playerModelUpdate.gold !== undefined) {
      actions.changeGold({
        payload: playerModelUpdate.gold,
        isSelf,
        isSet: true
      });
    }

    if (playerModelUpdate.health !== undefined) {
      actions.changeHealth({
        payload: playerModelUpdate.health,
        isSelf,
        isSet: true
      });
    }
  })
};

export default playersModel;

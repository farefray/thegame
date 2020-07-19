import { action, Action } from 'easy-peasy';
import { Card } from '@/types/Card';

export interface OpponentModel {
  health: number;
  changeHealth: Action<OpponentModel, number>;

  gold: number;
  changeGold: Action<OpponentModel, number>;

  hand: Array<Card>;
  handCardToDiscard: Action<OpponentModel, string>;

  deckSize: number;
  discard: Card[];
}

const opponentModel: OpponentModel = {
  health: 50,
  changeHealth: action((state, amount) => {
    state.health += amount;
  }),

  gold: 0,
  changeGold: action((state, amount) => {
    state.gold += amount;
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

  deckSize: 0,
  discard: [],
};

export default opponentModel;

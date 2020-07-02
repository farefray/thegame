import { action, Action } from 'easy-peasy';

export interface MerchantryModel {
  revealedCards: Array<any>;
  revealCards: Action<MerchantryModel, any>;
}

const merchantryModel: MerchantryModel = {
  revealedCards: [],
  revealCards: action((state, payload) => {
    state.revealedCards = payload.revealedCards;
  }),
};

export default merchantryModel;

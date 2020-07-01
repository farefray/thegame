import { action, thunk, Action, Thunk } from 'easy-peasy';

export interface MerchantryModel {
  revealedCards: Array<any>;
  revealCards: Action<MerchantryModel, Array<any>>;
}

const merchantryModel: MerchantryModel = {
  revealedCards: [],
  revealCards: action((state, payload) => {
    state.revealedCards = payload;
  }),
};

export default merchantryModel;

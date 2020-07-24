import { action, Action, ThunkOn, thunkOn} from 'easy-peasy';
import { StoreModel } from '../model';

export interface MerchantryModel {
  isLocked: boolean;
  setLocked: Action<MerchantryModel, boolean>;
  onActivate: ThunkOn<MerchantryModel, MerchantryModel, StoreModel>;
  activeUID: string;
  activate: Action<MerchantryModel, any>;

  revealedCards: Array<any>;
  revealCards: Action<MerchantryModel, any>;
}

const merchantryModel: MerchantryModel = {
  isLocked: true,
  setLocked: action((state, isLocked) => {
    state.isLocked = isLocked;
  }),
  onActivate: thunkOn(
    (actions, storeActions) => storeActions.merchantry.activate,
    (actions, { payload }, { getStoreState, getStoreActions }) => {
      const { players } = getStoreState();
      const isLocked = players.uuid !== payload;
      actions.setLocked(isLocked);
    }
  ),
  revealedCards: [],
  revealCards: action((state, payload) => {
    state.revealedCards = payload.revealedCards;
  }),
  activeUID: '',
  activate: action((state, activeUID) => {
    state.activeUID = activeUID;
  })
};

export default merchantryModel;

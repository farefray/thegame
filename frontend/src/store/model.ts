import appModel, { AppModel } from './models/app';
import playerModel, { PlayerModel } from './models/player';
import gameboardModel, { GameboardModel } from './models/gameboard';
import customerModel, { CustomerModel } from './models/customer';
import merchantryModel, { MerchantryModel } from './models/merchantry';

// The interface representing our entire store model
export interface StoreModel {
  app: AppModel
  customer: CustomerModel
  gameboard: GameboardModel
  merchantry: MerchantryModel
  player: PlayerModel
}

const storeModel: StoreModel = {
  app: appModel,
  customer: customerModel,
  gameboard: gameboardModel,
  merchantry: merchantryModel,
  player: playerModel
}

export default storeModel;
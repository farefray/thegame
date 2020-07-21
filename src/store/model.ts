import appModel, { AppModel } from './models/app';
import playersModel, { PlayersModel } from './models/players';
import gameboardModel, { GameboardModel } from './models/gameboard';
import customerModel, { CustomerModel } from './models/customer';
import merchantryModel, { MerchantryModel } from './models/merchantry';
// import opponentModel, { OpponentModel } from './models/opponent';

// The interface representing our entire store model
export interface StoreModel {
  app: AppModel
  customer: CustomerModel
  gameboard: GameboardModel
  merchantry: MerchantryModel
  players: PlayersModel
}

const storeModel: StoreModel = {
  app: appModel,
  customer: customerModel,
  gameboard: gameboardModel,
  merchantry: merchantryModel,
  players: playersModel,
}

export default storeModel;
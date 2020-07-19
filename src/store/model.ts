import appModel, { AppModel } from './models/app';
import playerModel, { PlayerModel } from './models/player';
import gameboardModel, { GameboardModel } from './models/gameboard';
import customerModel, { CustomerModel } from './models/customer';
import merchantryModel, { MerchantryModel } from './models/merchantry';
import opponentModel, { OpponentModel } from './models/opponent';

// The interface representing our entire store model
export interface StoreModel {
  app: AppModel
  customer: CustomerModel
  gameboard: GameboardModel
  merchantry: MerchantryModel
  player: PlayerModel
  opponent: OpponentModel
}

const storeModel: StoreModel = {
  app: appModel,
  customer: customerModel,
  gameboard: gameboardModel,
  merchantry: merchantryModel,
  player: playerModel,
  opponent: opponentModel
}

export default storeModel;
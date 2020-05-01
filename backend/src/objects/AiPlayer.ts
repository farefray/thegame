
import AIService from '../services/AIService';
import Player from './Player';

const Container = require('typedi').Container;

export default class AiPlayer extends Player {
  constructor(id: string) {
    super(id);

    Container.set('player.one', this);
  }

  beforeBattle(opponent: Player) {
    super.beforeBattle(opponent);

    Container.set('player.two', opponent);

    const affortableUnits = this.getAffortableShopUnits();
    if (affortableUnits.length > 0) {
      const unit = AIService(Container).considerUnitsPurchase(affortableUnits);
      if (unit && unit.name !== undefined) { // !-- underinfed must be fixed
        this.purchasePawn(this.shopUnits.findIndex(({ name }) => name === unit.name));
      }
    }

    if (Object.keys(this.hand).length) {
      AIService(Container).considerUnitsPlacing();
    }
  }

  getAffortableShopUnits() {
    return this.shopUnits.filter(unit => unit.cost <= this.gold);
  }
}

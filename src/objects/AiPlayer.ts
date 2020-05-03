import AIService from '../services/AIService';
import Player from './Player';

export default class AiPlayer extends Player {
  private ai;

  constructor(id: string) {
    super(id);

    this.ai = AIService(this);
  }

  beforeBattle(opponent: Player) {
    super.beforeBattle(opponent);

    const affortableUnits = this.getAffortableShopUnits();
    if (affortableUnits.length > 0) {
      const unit = this.ai.considerUnitsPurchase(affortableUnits);
      if (unit && unit.name !== undefined) { // !-- underinfed must be fixed
        this.purchasePawn(this.shopUnits.findIndex(({ name }) => name === unit.name));
      }
    }

    if (Object.keys(this.hand).length) {
      this.ai.considerUnitsPlacing();
    }
  }

  getAffortableShopUnits() {
    return this.shopUnits.filter(unit => unit.cost <= this.gold);
  }
}

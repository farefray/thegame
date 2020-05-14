import Player from './Player';
import BattleUnit from './BattleUnit';
import AIService from '../services/AIService';

export default class AiPlayer extends Player {
  constructor(id: string) {
    super(id);
  }

  considerUnitsPurchase(affortableUnits: BattleUnit[], opponentUnits: BattleUnit[] /** not used!! */) {
    if (!this.isBoardFull()) {
      // we definately need to buy some unit, find most suitable
      return AIService.getInstance().mostSuitableUnit(this.board.units(), affortableUnits, this.allowedBoardSize());
    }

    // todo logic here to find any good units in pocket
    return null;
  }

  considerUnitsPlacing() {
    if (!this.isBoardFull()) {
      // we need to place units for sure!
      const unit = AIService.getInstance().mostSuitableUnit(this.board.units(), this.hand.units(), this.allowedBoardSize());

      if (unit) {
        const prefereablePosition = unit.getPreferablePosition(this.board.freeSpots());
        this.movePawn(unit.stringifiedPosition, prefereablePosition);
      }
    }
  }

  beforeBattle(opponent: Player) {
    super.beforeBattle(opponent);

    const affortableUnits = this.getAffortableShopUnits();
    if (affortableUnits.length > 0) {
      const unit = this.considerUnitsPurchase(affortableUnits, opponent.board.units());
      if (unit) {
        this.purchasePawn(this.shopUnits.findIndex(({ name }) => name === unit.name));
      }
    }

    if (this.hand.unitsAmount()) {
      this.considerUnitsPlacing();
    }
  }

  getAffortableShopUnits() {
    return this.shopUnits.filter(unit => unit.cost <= this.gold);
  }
}

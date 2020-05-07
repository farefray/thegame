import Player from './Player';
import BattleUnit from './BattleUnit';

const findMostSuitableUnit = (units: BattleUnit[]) => {
  // todo logic here
  return units[Math.floor(Math.random() * units.length)];
};

export default class AiPlayer extends Player {
  constructor(id: string) {
    super(id);
  }

  considerUnitsPurchase(affortableUnits: BattleUnit[], opponentUnits: BattleUnit[]) {
    if (!this.isBoardFull()) {
      // we definately need to buy some unit, find most suitable
      return findMostSuitableUnit(affortableUnits);
    }

    // todo logic here to find any good units in pocket
    return null;
  }

  considerUnitsPlacing() {
    if (!this.isBoardFull()) {
      // we need to place units for sure!
      const unit = findMostSuitableUnit(this.hand.units());

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

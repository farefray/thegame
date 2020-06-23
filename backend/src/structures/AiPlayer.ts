import Player from './Player';
import AIService from '../services/AI';

export enum StrategyFlags {
  PICK_BEST_UNITS = 1 << 0,
  PICK_BEST_POSITIONS = 1 << 1,
  ALLOW_SWITCH_UNITS = 1 << 2,
}

export class AIFlags {
  private flags: StrategyFlags = StrategyFlags.PICK_BEST_POSITIONS | StrategyFlags.PICK_BEST_UNITS;

  public addStrategyFlags(strategy: StrategyFlags) {
    if ((this.flags & strategy) === strategy) {
      return;
    }

    this.flags |= strategy;
  }

  public removeStrategyFlags(strategy: StrategyFlags) {
    if ((this.flags & strategy) === strategy) {
      this.flags &= ~strategy;
    }
  }

  public hasStrategyFlags(strategy: StrategyFlags) {
    return ((this.flags & strategy) === strategy);
  }
}

export default class AiPlayer extends Player {
  public AIFlags: AIFlags;

  constructor(id: string) {
    super(id);

    this.AIFlags = new AIFlags();
  }

  considerUnitsPurchase() {
    const affortableUnits = this.getAffortableShopUnits();
    if (!affortableUnits.size) {
      return null;
    }

    if (!this.isBoardFull()) {
      // we definately need to buy some unit, find most suitable
      const amount = Math.min(this.allowedBoardSize() - this.board.units().size, affortableUnits.size);
      return AIService.getInstance().mostSuitableUnit({
        current: this.board.units(),
        proposed: affortableUnits,
        amount
      }, this.AIFlags);
    }

    // todo magic logic here to find any good units in pocket
    return null;
  }

  considerUnitsPlacing() {
    if (!this.isBoardFull()) {
      // we need to place units for sure!
      const unit = AIService.getInstance().mostSuitableUnit({
        current: this.board.units(),
        proposed: this.hand.units(),
        amount: this.allowedBoardSize()
      }, this.AIFlags);

      if (unit) {
        const prefereablePosition = unit.getPreferablePosition(this.board.freeSpots());
        this.moveUnitBetweenPositions(unit.position, prefereablePosition);
      }
    }
  }

  beforeBattle(opponent: Player) {
    super.beforeBattle(opponent);

    // consider buying new units
    const unit = this.considerUnitsPurchase();
    if (unit) {
      const shopUnit = this.shopUnits.findByName(unit.name);

      if (shopUnit) {
        this.purchasePawn(shopUnit.x);
      }
    }

    if (this.hand.units().size) {
      this.considerUnitsPlacing();
    }
  }

  getAffortableShopUnits() {
    return this.shopUnits.filter(unit => unit.cost <= this.gold);
  }
}

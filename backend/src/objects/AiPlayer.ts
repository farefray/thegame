import Player from './Player';
import BattleUnit from './BattleUnit';
import AIService from '../services/AIService';
import BattleUnitList from './BattleUnit/BattleUnitList';

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
  private AIService: AIService;
  public AIFlags: AIFlags;

  constructor(id: string) {
    super(id);

    this.AIService = AIService.getInstance();
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
      return this.AIService.mostSuitableUnit({
        current: this.board.units(),
        proposed: affortableUnits,
        amount: amount
      }, this.AIFlags);
    }

    // todo magic logic here to find any good units in pocket
    return null;
  }

  considerUnitsPlacing() {
    if (!this.isBoardFull()) {
      // we need to place units for sure!
      const unit = this.AIService.mostSuitableUnit({
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

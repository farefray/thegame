import Player from './Player';
import Merchantry from './Merchantry';

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
  public isAI = true;

  constructor(id: string, subscribers) {
    super(id, subscribers);

    this.AIFlags = new AIFlags();

    this.invalidate();
  }

  public tradeRound(merchantry: Merchantry) {
    const affortableCards = merchantry.getRevealedCards().filter(card => card.cost <= this.gold);
    if (!affortableCards.size) {
      return -1;
    }

    // todo pick by ai network
    const mostExpensiveCard = affortableCards.sort((a, b) => a.cost > b.cost).get(0);
    const index = merchantry.getRevealedCards().findIndex(card => card.name === mostExpensiveCard.name);
    return index;
  }

  getAffortableShopUnits() {
    return new Map(); // todo this.shopUnits.filter(unit => unit.cost <= this.gold);
  }
}

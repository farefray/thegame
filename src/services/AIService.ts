import AiPlayer from '../objects/AiPlayer';
import BattleUnit from '../objects/BattleUnit';
import Player from '../objects/Player';

const findMostSuitableUnit = (units: BattleUnit[]) => {
  // todo logic here
  return units[Math.floor(Math.random() * units.length)];
};

const findMostSuitablePosition = (self: AiPlayer, unit: BattleUnit) => {
  return unit.getPreferablePosition(self.board.freeSpots());
};

export default class AIService {
  private self: AiPlayer;
  constructor(self: AiPlayer) {
    this.self = self;
  }

  considerUnitsPurchase(affortableUnits: BattleUnit[], opponentUnits: BattleUnit[]) {
    if (!this.self.isBoardFull()) {
      // we definately need to buy some unit, find most suitable
      return findMostSuitableUnit(affortableUnits);
    }

    // todo logic here to find any good units in pocket
    return null;
  }

  considerUnitsPlacing() {
    if (!this.self.isBoardFull()) {
      // we need to place units for sure!
      const unit = findMostSuitableUnit(this.self.hand);

      if (unit) {
        this.self.movePawn(unit.stringifiedPosition, findMostSuitablePosition(this.self, unit));
      }
    }
  }
}

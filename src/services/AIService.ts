import Player from '../objects/Player';
import AiPlayer from '../objects/AiPlayer';
import BattleUnit from '../objects/BattleUnit';

const findMostSuitableUnit = (units: BattleUnit[]) => {
  // todo logic here
  return units[Math.floor(Math.random() * units.length)];
};

const findMostSuitablePosition = (unit: BattleUnit) => {
  // todo logic here
  return '2,2';
}

export default function AIService(dependencyContainer) {
  const self: AiPlayer = dependencyContainer.get('player.one');
  const opponent: Player = dependencyContainer.get('player.two');

  return {
    considerUnitsPurchase: (affortableUnits: BattleUnit[]) => {
      if (!self.isBoardFull()) {
        // we definately need to buy some unit, find most suitable
        return findMostSuitableUnit(affortableUnits);
      }

      // todo logic here to find any good units in pocket
      return null;
    },
    considerUnitsPlacing: () => {
      if (!self.isBoardFull()) {
        // we need to place units for sure!
        const unit = findMostSuitableUnit(self.hand);

        if (unit) {
          self.movePawn(unit.stringifiedPosition, findMostSuitablePosition(unit));
        }
      }
    },
  };
}

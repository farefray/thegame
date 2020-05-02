import Player from '../objects/Player';
import AiPlayer from '../objects/AiPlayer';
import { MonsterInterface } from '../abstract/Monster';
import BattleUnit from '../objects/BattleUnit';

export default function AIService(dependencyContainer) {
  const Container = dependencyContainer;

  const self: AiPlayer = Container.get('player.one');
  const opponent: Player = Container.get('player.two');

  const findMostSuitableUnit = (units: BattleUnit[]|MonsterInterface[]) => {
    // todo logic here
    return units[Math.floor(Math.random() * units.length)];
  };

  return {
    considerUnitsPurchase: (affortableUnits: MonsterInterface[]) => {
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
        // todo hand must be array also? :)
        const unit = findMostSuitableUnit(self.hand);

        // todo place unit to board
      }
    },
  };
}

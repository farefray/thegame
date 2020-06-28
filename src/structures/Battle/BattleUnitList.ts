import BattleUnit from '../BattleUnit';
import Position from '../../shared/Position';
import AbstractList from '../abstract/AbstractList';

export default class BattleUnitList extends AbstractList<BattleUnit> {
  get unitNames() {
    return this._list.reduce((prev: string[], cur) => {
      prev.push(cur.name);
      return prev;
    }, []);
  }

  byTeam(teamId: number) {
    return this.filter((unit) => unit.teamId === teamId);
  }

  findByName(searchName) {
    return this._list.find(({ name }) => name === searchName);
  }

  areDamaged() {
    return this.filter(({ health, maxHealth }) => health < maxHealth);
  }

  fromPositions(positions: Array<Position>): BattleUnitList {
    const units = new BattleUnitList([]);

    for (const unit of this) {
      const { x, y } = unit;
      const isOnPositions = positions.reduce((prev, curr) => (prev || curr.x === x && curr.y === y), false);
      if (isOnPositions) {
        units.push(unit);
      }
    }

    return units;
  }
}

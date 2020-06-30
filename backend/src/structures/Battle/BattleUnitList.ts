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

  /**
   * Returns team id of units which are only the ones left on the board
   * @returns {number} 0 or 1 for teams, -1 for neutrals, -2 for error
   */
  onlyTeamLeft() {
    return this._list.reduce((teams: number[], unit) => {
      teams.push(unit.teamId)
      return teams;
    }, []).reduce((resultedTeam: 0 | 1 | -1 | -2, teamId) => {
      if (resultedTeam === -2) {
        return -2; // once error, always error
      }

      if (resultedTeam === -1) {
        // first unit, take his team as resulted
        return teamId === 0 ? 0 : 1;
      }

      // we already have some value from previous unit
      if (teamId === 0 || teamId === 1) {
        // if that value is not matching current unit value, return error
        if (teamId !== resultedTeam) {
          return -2;
        }

        return teamId;
      }

      return -1;
    }, -1)
  }
}

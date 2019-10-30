import Spell from '../abstract/Spell';
import pathUtils from '../utils/pathUtils';

function Regeneration(caster) {
  return new Spell(caster, {
    canBeCast: (units) => {
      // move to some abstract thing, like spellUtils.getClosestTarget(amount: 1, enemy: true)
      const target = pathUtils.getClosestTarget({ x: this.caster.x, y: this.caster.y, targets: units.filter(u => u.team === this.oppositeTeam() && u.isAlive()) });

      if (!target) {
        return false;
      }

      this.updateProps({ target });
      return true;
    },
    execute: () => {
      this.props.target.healthChange(-caster.spellconfig.value);
    }
  });
}

export default Regeneration;

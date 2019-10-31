import pathUtils from '../utils/pathUtils';

function Regeneration(self) {
  const caster = self.caster;
  return {
    canBeCast: ({ units }) => {
      // move to some abstract thing, like spellUtils.getClosestTarget(amount: 1, enemy: true)
      const target = pathUtils.getClosestTarget({ x: caster.x, y: caster.y, targets: units.filter(u => u.team === self.caster.oppositeTeam() && u.isAlive()) });

      if (!target) {
        return false;
      }

      self.updateProps({ target });
      return true;
    },
    cast: () => {
      // initial cast
      const target = self.props.target;
      const regenValue = caster.spellconfig.value;
      target.healthChange(regenValue);

      // side effect [todo]
      self.props.addSideEffect({
        effect: () => {
          target.healthChange(regenValue);
        },
        tick: 1000,
        amount: 15
      });
    }
  };
}

export default Regeneration;

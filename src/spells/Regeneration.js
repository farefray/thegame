function Regeneration(self) {
  const caster = self.caster;
  return {
    prepare: ({ units }) => {
      // move to some abstract thing, like spellUtils?
      // get alied unit with lowest health
      const target = units
        .filter(u => {
          return u.team === caster.team && u.isAlive();
        })
        .sort((a, b) => a.health - b.health)
        .shift();

      if (!target) {
        return false;
      }

      self.updateProps({ target });
      return true;
    },
    cast: () => {
      const target = self.props.target;
      const { spellconfig } = caster;
      const regenValue = spellconfig.value;
      target.healthChange(regenValue, caster.id);

      self.props.addSideEffect(caster, {
        effect: () => {
          if (target && target.isAlive()) {
            target.healthChange(regenValue, caster.id);
          }
        },
        tick: 1000,
        amount: spellconfig.ticks
      });

      return true;
    }
  };
}

export default Regeneration;

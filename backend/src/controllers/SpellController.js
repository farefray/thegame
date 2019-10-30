
import pathUtils from '../utils/pathUtils';

import regeneration from '../spells/regeneration';

const SpellController = {};

SpellController.constructSpell = function ();

SpellController.castSpell = function (battle, battleUnit) {
  // generic checks for all spells
  const { mana: manaRequired } = battleUnit.spellconfig;
  if (manaRequired) {
    if (battleUnit.mana < manaRequired) return false;
  }

  // construct spell and check its own requirements
  const spell = new regeneration(battleUnit);
  if (spell.canBeCast(units)) {
    battleUnit.manaChange(-manaRequired);
    return spell.execute();
  }

  return false;
}

export default SpellController;

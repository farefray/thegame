import Regeneration from '../spells/regeneration';

/**
 * @description Data structure which respresents spell logic
 * @returns {Spell}
 */


function Spell(spellname, caster) {
  // Holds evaluated data required for spell to be cast
  this.props = {};

  this.updateProps = (props) => {
    this.props = Object.assign(this.props, props);
  };

  this.caster = caster;

  // Checks if spell can be cast and saves props
  this.canBeCast = (units) => { // eslint-disable-line
    return true;
  };

  // Casts spell by modifying actionStack
  this.execute = () => {  // eslint-disable-line
  };

  return new Regeneration(this);
}

export default Spell;

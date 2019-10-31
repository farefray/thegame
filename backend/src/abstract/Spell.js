import spellsUtils from '../utils/spellUtils';
/**
 * @description Data structure which respresents spell logic
 * @returns {Spell}
 */

function Spell(spellname, caster) {
  // Holds evaluated data required for spell to be cast
  this.props = {
    // in case spell is affecting gameboard after cast, such effects are being pushed into actionqueue side effects and being executed without battle unit actions
    addSideEffect: () => {

    }
  };

  this.updateProps = (props) => {
    this.props = Object.assign(this.props, props);
  };

  this.caster = caster;

  // Checks if spell can be cast and saves props
  this.canBeCast = (units) => { // eslint-disable-line
    return true;
  };

  // Casts spell by modifying actionStack
  this.cast = () => {  // eslint-disable-line
  };

  return Object.assign({}, this, spellsUtils.loadSpell(spellname, this));
}

export default Spell;

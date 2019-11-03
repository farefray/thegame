import spellsUtils from '../utils/spellUtils';
/**
 * @description Data structure which respresents initial object for a spell logic
 * All the spells are entending this one, overwriting those methods
 * @returns {Spell}
 */

function Spell(spellname, caster) {
  // Holds evaluated data required for spell to be cast
  this.props = {
    // in case spell is affecting gameboard after cast, such effects are being pushed into actionqueue side effects and being executed without battle unit actions
    addSideEffect: (_caster, sideEffect) => {
      _caster.proxied('actionQueue').addSideEffect(sideEffect);
    }
  };

  this.updateProps = (props) => {
    this.props = Object.assign(this.props, props);
  };

  this.caster = caster;

  // Checks if requirements for spell cast were met and stores them into props for later cast
  this.prepare = (units) => { // eslint-disable-line
    return true;
  };

  this.cast = () => {}; // eslint-disable-line

  return Object.assign({}, this, spellsUtils.loadSpell(spellname, this));
}

export default Spell;

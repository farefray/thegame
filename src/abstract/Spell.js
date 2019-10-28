/**
 * @description Data structure which respresents monsters spell
 * @param {Object} config of the spell
 * @param {Object} config.requirements for spell to be cast
 * @param {Integer} config.requirements.mana amount to be removed
 * @param {Object} config.requirements.target configuration
 * @param {String} config.requirements.target.type {String} 'single'|
 * @param {Integer} config.requirements.target.distance {Integer}
 * @param {Object} config.config for spell effec
 * @param config.config.target 's effect
 * @param config.config.target.damage amount for hp to change
 * @param config.config.self effect to self
 * @param config.config.self.damage amount for hp to change
 * @returns {Spell}
 */

function Spell(config) {
  return Object.assign(this, config);
}

export default Spell;

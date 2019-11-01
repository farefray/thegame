/**
 * @description Data structure which respresents monsters spell with basic configuration.
 * We hold here only configuration for common spell parts, which later is being used inside spell logic(so we can adjust values right from monster configuration, while hard spell logic stays separated and we do not mess inside)
 * @param {Object} config
 * @param {String} config.name Spell name, to load proper logic
 * @param {Integer} config.mana
 * @param {Integer} config.value
 * @returns {SpellConfig}
 */

function SpellConfig(config) {
  return Object.assign(this, config);
}

export default SpellConfig;

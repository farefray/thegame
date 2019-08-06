const fs = require('fs');
const pawns = require('./pawns');
const f = require('./f');

const abilityDefaults = {
  mana: 100,
  lifestealValue: 0.5,
  dotAccuracy: 1.0,
  dotDamage: 1 / 16,
  aoeRange: 1,
  range: 8,
  multiStrikePercentage: [0.375, 0.375, 0.125, 0.125],
};

exports.getAbilityDefault = name => abilityDefaults[name];

/**
  * Read from json file
  * Convert to immutable Map structure
  * accuracy doesn't matter: Default 100
  * power def 0
  * noTarget, lifesteal, aoe default false
  * mana default 100
  * noTargetEffect
  * unique TODO
  */
async function loadImmutableAbilitiesJSON() {
  return JSON.parse(fs.readFileSync('pokemonAbilities.json', 'utf8'));
}

const abilitiesMap = loadImmutableAbilitiesJSON();

exports.getDefault = name => abilityDefaults[name];

exports.getAbility = async (name) => {
  // console.log('@abilties.getAbility', name);
  const ability = (await pawns.getStats(name))['ability'];
  const returnMe = (await abilitiesMap)[ability];
  if (f.isUndefined(returnMe)) console.log('@getAbility undefined', name);
  return returnMe;
};

exports.getMap = () => abilitiesMap;

// TODO perf all this...

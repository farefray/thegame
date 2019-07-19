const {
  Map,
  List,
  Set,
  fromJS,
} = require('immutable');
const deckJS = require('../deck');
const playerJS = require('../player');
const f = require('../f');
const gameConstantsJS = require('../game_constants');

const pawns = require('../pawns');
const abilitiesJS = require('../abilities');

const BattleunitJS = {};

/**
 * Create unit for board battle from createBoardUnit unit given newpos/pos and team
 */
BattleunitJS.createBattleUnit = async (unit, unitPos, team) => {
  const unitStats = await pawns.getStats(unit.get('name'));
  const ability = await abilitiesJS.getAbility(unit.get('name'));
  // if(ability.get('mana')) console.log('@createBattleUnit', unit.get('name'), unitStats.get('ability'), ability.get('mana'));
  return unit.set('team', team).set('attack', unitStats.get('attack'))
    .set('hp', unitStats.get('hp'))
    .set('maxHp', unitStats.get('hp'))
    .set('startHp', unitStats.get('hp'))
    .set('type', unitStats.get('type'))
    .set('next_move', unitStats.get('next_move') || pawns.getStatsDefault('next_move'))
    .set('mana', unitStats.get('mana') || pawns.getStatsDefault('mana'))
    .set('ability', unitStats.get('ability'))
    .set('defense', unitStats.get('defense') || pawns.getStatsDefault('defense'))
    .set('speed', pawns.getStatsDefault('upperLimitSpeed') - (unitStats.get('speed') || pawns.getStatsDefault('speed')))
    /* .set('mana_hit_given', unitStats.get('mana_hit_given') || pawns.getStatsDefault('mana_hit_given'))
    .set('mana_hit_taken', unitStats.get('mana_hit_taken') || pawns.getStatsDefault('mana_hit_taken')) */
    .set('mana_multiplier', unitStats.get('mana_multiplier') || pawns.getStatsDefault('mana_multiplier'))
    .set('specialAttack', unitStats.get('specialAttack'))
    .set('specialDefense', unitStats.get('specialDefense'))
    .set('position', unitPos)
    .set('range', unitStats.get('range') || pawns.getStatsDefault('range'))
    .set('manaCost', ability.get('mana') || abilitiesJS.getDefault('mana'));
}

module.exports = BattleunitJS;

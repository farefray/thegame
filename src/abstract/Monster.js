/**
 * @description Data structure which respresents monster
 * @returns {Monster}
 */

const defaultMonster = {
  lookType: 1,
  cost: 1,
  hp: 0, // todo rename to health
  mana: 0,
  attack: 0,
  attackRange: 1,
  particle: 0,
  armor: 0,
  speed: 1000,
  attackSpeed: 1000,
  maxMana: 100,
  manaRegen: 2,
  healthRegen: 5
};

function Monster(params) {
  return Object.assign(this, defaultMonster, params);
}

export default Monster;

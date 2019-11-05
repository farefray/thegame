/**
 * @description Data structure which respresents monster
 * @returns {Monster}
 */

const defaultMonster = {
  armor: 0,
  attack: 0,
  attackRange: 1,
  attackSpeed: 1000,
  cost: 1,
  healthRegen: 5,
  lookType: 1,
  manaRegen: 2,
  maxHealth: 0,
  maxMana: 100,
  particle: 0, // would be good to remove
  speed: 1000,
};

function Monster(params) {
  return Object.assign(this, defaultMonster, params);
}

export default Monster;

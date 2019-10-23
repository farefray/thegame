/**
 * @description Data structure which respresents monster
 * @returns {Monster}
 */

function Monster(
  params = {
    lookType: 1,
    cost: 1,
    hp: 0,
    mana: 0,
    attack: 0,
    attackRange: 1,
    particle: 0,
    armor: 0,
    speed: 1000,
    attackSpeed: 1000,
    manaRegen: 0
  }
) {
  return Object.assign(this, params);
}

export default Monster;

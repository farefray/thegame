import Monster from '../abstract/Monster';

function Elf() {
  return new Monster({
    lookType: 62,
    cost: 1,
    hp: 150,
    mana: 0,
    attack: 45,
    attackRange: 3,
    particle: 1,
    armor: 2,
    speed: 1200,
    attackSpeed: 1000,
    manaRegen: 10
  });
}

export default Elf;

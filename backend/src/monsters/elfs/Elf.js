import Monster from '../../abstract/Monster';

function Elf() {
  return Monster({
    armor: 2,
    attack: 45,
    attackRange: 3,
    attackSpeed: 1000,
    cost: 1,
    lookType: 62,
    mana: 0,
    manaRegen: 10,
    maxHealth: 150,
    particle: 1,
    speed: 1200,
  });
}

export default Elf;

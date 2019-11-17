import Monster from '../../abstract/Monster';

function Elf_Scout() {
  return Monster({
    armor: 0,
    attack: 55,
    attackRange: 5,
    attackSpeed: 1000,
    cost: 2,
    lookType: 64,
    mana: 0,
    manaRegen: 5,
    maxHealth: 350,
    particle: 1,
    speed: 1000,
  });
}

export default Elf_Scout;

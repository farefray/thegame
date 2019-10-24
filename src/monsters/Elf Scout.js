import Monster from '../abstract/Monster';

function Elf_Scout() {
  return new Monster({
    lookType: 64,
    cost: 2,
    hp: 350,
    mana: 0,
    attack: 55,
    attackRange: 5,
    particle: 1,
    armor: 0,
    speed: 1000,
    attackSpeed: 1000,
    manaRegen: 5
  });
}

export default Elf_Scout;

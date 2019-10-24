import Monster from '../../abstract/Monster';

function Elf_Arcanist() {
  return new Monster({
    lookType: 63,
    cost: 3,
    hp: 550,
    mana: 0,
    attack: 85,
    attackRange: 3,
    particle: 1,
    armor: 1,
    speed: 1400,
    attackSpeed: 900,
    manaRegen: 20
  });
}

export default Elf_Arcanist;

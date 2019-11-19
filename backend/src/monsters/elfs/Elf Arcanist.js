import Monster from '../../abstract/Monster';

function Elf_Arcanist() {
  return Monster({
    armor: 1,
    cost: 3,
    lookType: 63,
    mana: 0,
    manaRegen: 20,
    maxHealth: 550,
    speed: 1400,
  });
}

export default Elf_Arcanist;

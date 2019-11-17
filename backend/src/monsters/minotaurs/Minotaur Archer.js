import Monster from '../../abstract/Monster';

function Minotaur_Archer() {
  return Monster({
    armor: 4,
    attack: 70,
    attackRange: 4,
    attackSpeed: 1500,
    cost: 2,
    lookType: 24,
    mana: 0,
    manaRegen: 5,
    maxHealth: 550,
    particle: 1,
    speed: 1200,
  });
}

export default Minotaur_Archer;

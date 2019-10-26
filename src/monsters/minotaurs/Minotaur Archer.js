import Monster from '../../abstract/Monster';

function Minotaur_Archer() {
  return new Monster({
    lookType: 24,
    cost: 2,
    hp: 550,
    mana: 0,
    attack: 70,
    attackRange: 4,
    particle: 1,
    armor: 4,
    speed: 1200,
    attackSpeed: 1500,
    manaRegen: 5
  });
}

export default Minotaur_Archer;

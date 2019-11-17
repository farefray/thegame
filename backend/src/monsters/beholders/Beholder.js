import Monster from '../../abstract/Monster';

function Beholder() {
  return Monster({
    "armor": 2,
    "attack": 75,
    "attackRange": 4,
    "attackSpeed": 1000,
    "cost": 3,
    "lookType": 17,
    "mana": 0,
    "manaRegen": 10,
    "maxHealth": 750,
    "particle": 1,
    "speed": 800,
  });
}

export default Beholder;

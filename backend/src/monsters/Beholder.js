import Monster from '../abstract/Monster';

function Beholder() {
  return new Monster({
    "lookType": 17,
    "cost": 3,
    "hp": 750,
    "mana": 0,
    "attack": 75,
    "attackRange": 4,
    "particle": 1,
    "armor": 2,
    "speed": 800,
    "attackSpeed": 1000,
    "manaRegen": 10
  });
}

export default Beholder;

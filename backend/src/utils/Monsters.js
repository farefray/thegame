import monsters from '../monsters/loader';

const Monsters = {
  units: {}
};

Object.keys(monsters).forEach(element => {
  const monsterName = element.toLowerCase();
  Monsters.units[monsterName] = Object.assign({
    name: monsterName
  }, monsters[element].default());
});

Monsters.getMonsterStats = name => Monsters.units[name.toLowerCase()];

const randomProperty = function(obj) {
  const keys = Object.keys(obj);
  return obj[keys[(keys.length * Math.random()) << 0]]; // eslint-disable-line
};

Monsters.getRandomUnit = () => randomProperty(Monsters.units);

export default Monsters;

import * as monsters from '../monsters/loader';

// Refactor this to TS please

const Monsters = {
  units: {}
};

Object.keys(monsters.default).forEach(element => {
  const monsterName = element.toLowerCase();
  const mob = monsters.default[element]();
  Monsters.units[monsterName] = Object.assign({
    name: monsterName
  }, mob);
});

Monsters.getMonsterStats = name => Monsters.units[name.toLowerCase()];

const randomProperty = function(obj) {
  const keys = Object.keys(obj);
  return obj[keys[(keys.length * Math.random()) << 0]]; // eslint-disable-line
};

Monsters.getRandomUnit = (filterObject) => {
  const filtered = {};
  Object.keys(Monsters.units).forEach(key => {
    const mob = Monsters.units[key];
    if (!filterObject
      || !filterObject.cost
      || mob.cost <= filterObject.cost) {
        filtered[key] = mob;
      }
  });

  return randomProperty(filtered);
};

export default Monsters;

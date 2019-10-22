const monsters = require('./monsters.json');

const Pawns = {};
Pawns.getMonsterStats = name => monsters[name.toLowerCase()];

const randomProperty = function (obj) {
  const keys = Object.keys(obj);
  return obj[keys[keys.length * Math.random() << 0]];
};

Pawns.getRandomUnit = () => {
  return randomProperty(monsters);
};

export default Pawns;

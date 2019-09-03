const DIRECTION_NORTH = 3;
const DIRECTION_SOUTH = 1;
const DIRECTION_WEST = 2;
const DIRECTION_EAST = 4;

function encodeData(data) {
  return Object.keys(data)
    .map(function(key) {
      return [key, data[key]].map(encodeURIComponent).join('=');
    })
    .join('&');
}

const DOMAIN = 'http://sprites.epizy.com/';
const SCRIPTS = {
  ANIMATED: 'animoutfit.php',
  IDLE: 'outfit.php'
};

export default (lookType, direction = DIRECTION_NORTH, idle = false) => {
  const params = encodeData({
    id: lookType,
    direction: direction,
    addons: 0,
    head: 1,
    body: 1,
    legs: 1,
    feed: 1,
    mount: 0
  });

  return DOMAIN.concat(SCRIPTS[idle ? 'IDLE' : 'ANIMATED'], '?', params);
};

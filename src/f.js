const shuffle = require('immutable-shuffle');
const gameConstantsJS = require('./game_constants');

const Position = require('../app/src/objects/Position');

const isUndefined = obj => typeof obj === 'undefined';
exports.isUndefined = obj => isUndefined(obj);

exports.getRandomInt = max => Math.floor(Math.random() * Math.floor(max));

const x = position => {
  const splitted = position.split(',');
  const curr = splitted[0];
  return parseInt(curr, 10);
};

const y = position => {
  const splitted = position.split(',');
  const curr = splitted[1];
  return parseInt(curr, 10);
};

exports.pos = (px, py) => new Position(px, py).toBoardPosition();
exports.coords = position => ({
  x: position.split(',')[0],
  y: position.split(',')[1]
});

exports.x = position => x(position);
exports.y = position => y(position);

/**
 * @description Given a position, returns if it is on hand or board
 * @param {BoardPosition}
 * @returns {Boolean}
 */
exports.isPositionBelongsToHand = position => (y(position) === -1);

/**
 * Reverses position, your units position on enemy boards
 */
exports.reverseUnitPos = posInput => new Position(7 - x(posInput), 7 - y(posInput)).toBoardPosition();

// exports.print = (obj, msg) => console.log(msg + JSON.stringify(obj)); // Normal version
exports.print = (obj, msg = '') => console.log(msg + JSON.stringify(obj, null, 2)); // Pretty printed version

const p = (msg, msgs) => {
  if (gameConstantsJS.debugMode) {
    let s = msg;
    if (!isUndefined(msgs)) {
      for (let i = 0; i < msgs.length; i++) {
        s += ` ${msgs[i]}`;
      }
    }
    console.log(s);
  }
};

exports.p = (msg, ...msgs) => p(msg, msgs);

exports.printBoard = async (board, move) => {
  if (isUndefined(board) || isUndefined(move)) {
    throw new Error('Board is undefined!');
  }

  p(` -- Move @${move['time']}: ${move['action']} ${move['action'] === 'attack' ? move['direction'] : ''}`);
  for (const boardPos in board) {
    const xPos = x(boardPos);
    const yPos = y(boardPos);
    const action = move['action'];
    const target = move['target'];
    const unitPos = move['unitPos'];
    const effect = move['effect'];
    // Unit start string
    const builtString = `${board[boardPos]['team'] === 0 ? 'o' : 'x'}{${xPos},${yPos}}: ` + `${board[boardPos]['name']}. hp: ${board[boardPos]['hp']} mana: ${board[boardPos]['mana']}`;
    let resultString = builtString;
    // Move string TODO Print dot damage here as well
    if ((x(unitPos) === xPos && y(unitPos) === yPos) || (action === 'move' && x(target) === xPos && y(target) === yPos)) {
      resultString =
        `${builtString} : ${action}(` +
        `${
          move['abilityName']
            ? `${move['abilityName']}, ` + `${effect && effect.size > 0 ? (effect[target] ? `Dot applied: ${effect[target]['dot']}, ` : `Healed: ${effect[unitPos]['heal']}, `) : ''}`
            : ''
        }` +
        `target: {${x(target)},${y(target)}} ${isUndefined(move['value']) ? '' : `dmg: ${move['value']}`}${action === 'move' ? `from: {${x(unitPos)},${y(unitPos)}}` : ''})`;
    }
    p(resultString);
  }
  p('');
};

exports.push = (state, id, value) => state.set(id, state.get(id).push(value));

exports.shuffle = (state, id) => state.set(id, shuffle(state.get(id)));

const shuffleFisher = listParam => {
  let list = listParam;
  for (let i = list.size - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    // console.log('@shuffleFisher', i, randomIndex, 'Swapping', list.get(randomIndex), list.get(i), list)
    const last = list.get(i);
    list = list.set(i, list.get(randomIndex));
    list = list.set(randomIndex, last);
  }
  // console.log('shuffleFisher', list);
  return list;
};

exports.shuffleImmutable = list => shuffleFisher(list);

import Battle from '../objects/Battle';
import createBattleBoard from '../utils/createBattleBoard';

const BattleController = {};

const roundSetConfiguration = {
  1: [{ name: 'dwarf', x: 0, y: 7 }],
  2: [{ name: 'dwarf', x: 5, y: 6 }, { name: 'dwarf', x: 6, y: 7 }],
  3: [{ name: 'dwarf', x: 5, y: 6 }, { name: 'dwarf', x: 6, y: 7 }, { name: 'dwarf', x: 1, y: 7 }],
  4: [{ name: 'dwarf', x: 5, y: 6 }, { name: 'dwarf', x: 6, y: 7 }, { name: 'dwarf', x: 1, y: 7 }],
  5: [{ name: 'dwarf', x: 5, y: 6 }, { name: 'dwarf', x: 6, y: 7 }, { name: 'dwarf', x: 1, y: 7 }]
};

/**
 * Check not too many units on board
 * Calculate battle for given board, either pvp or npc/gym round
 */
BattleController.setup = async state => {
  const players = Object.keys(state.get('players'));
  const round = state.get('round');

  const npcBoard = roundSetConfiguration[round];

  // TODO: Future: All battles calculate concurrently, structurize this object maybe
  const results = {
    battleTime: 0,
    battles: {}
  }; // results for all battles and summary info

  let battleTime = 0;
  for (let i = 0; i < players.length; i++) {
    const playerBoard = state.getIn(['players', players[i], 'board']);
    // Check to see if a battle is required
    // Lose when empty, even if enemy no units aswell (tie with no damage taken)
    const board = createBattleBoard(playerBoard, npcBoard);

    // Both players have units, battle required
    const battleResult = new Battle(board);

    results.battles[players[i]] = {
      actionStack: battleResult['actionStack'],
      startBoard: battleResult['startBoard'],
      winner: battleResult.winner, // actually should be boolean I guess, as every player will have own battleresult(todo)
      playerDamage: battleResult.playerDamage
    };

    if (battleResult['actionStack'].length) {
      const playerBattleTime = battleResult['actionStack'][battleResult['actionStack'].length - 1].time;
      if (playerBattleTime > battleTime) {
        battleTime = playerBattleTime;
      }
    }
  }

  results.battleTime = battleTime + 1500; // adding extra 1.5 seconds delay to cover network issues and final effects
  return results;
};

export default BattleController;

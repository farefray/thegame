import Battle from '../objects/Battle';
import createBattleBoard from '../utils/createBattleBoard.ts';

const BattleController = {};

const roundSetConfiguration = {
  1: [{ name: 'dwarf', x: 0, y: 7 }],
  2: [{ name: 'dwarf', x: 5, y: 6 }, { name: 'dwarf_soldier', x: 6, y: 7 }],
  3: [{ name: 'dwarf_guard', x: 5, y: 6 }],
  4: [{ name: 'dwarf', x: 5, y: 6 }, { name: 'dwarf_guard', x: 6, y: 7 }, { name: 'dwarf', x: 1, y: 7 }],
  5: [{ name: 'dwarf', x: 5, y: 6 }, { name: 'dwarf_soldier', x: 6, y: 7 }, { name: 'dwarf_guard', x: 1, y: 7 }],
  6: [{ name: 'dwarf', x: 5, y: 6 }, { name: 'dwarf_soldier', x: 6, y: 7 }, { name: 'dwarf_guard', x: 1, y: 7 }, { name: 'elf', x: 2, y: 7 }]
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
    const board = createBattleBoard(
      {
        owner: players[i],
        units: playerBoard
      },
      {
        owner: '',
        units: npcBoard
      }
    );

    // Both players have units, battle required
    // todo async maybe and some good syntax
    const battleResult = new Battle({ board });
    const { actionStack, startBoard, winner, playerDamage } = battleResult;
    results.battles[players[i]] = {
      actionStack: actionStack,
      startBoard: startBoard,
      winner: winner,
      playerDamage: playerDamage
    };

    if (actionStack.length) {
      const playerBattleTime = actionStack[actionStack.length - 1].time;
      if (playerBattleTime > battleTime) {
        battleTime = playerBattleTime;
      }
    }
  }

  results.battleTime = Math.ceil(Number(battleTime) + 2000); // adding extra 2 seconds delay to cover network issues and final effects
  return results;
};

export default BattleController;

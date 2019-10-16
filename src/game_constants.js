import createBoard from './utils/createBoard';

const playerTestingBoards = {
  1: async () => createBoard([{ name: 'minotaur', x: 3, y: 1 }])
};

const roundSetConfiguration = {
  1: [{ name: 'dwarf', x: 0, y: 7 }],
  2: [{ name: 'dwarf', x: 5, y: 6 }, { name: 'dwarf', x: 6, y: 7 }],
  3: [{ name: 'dwarf', x: 5, y: 6 }, { name: 'dwarf', x: 6, y: 7 }, { name: 'dwarf', x: 1, y: 7 }],
  4: [{ name: 'dwarf', x: 5, y: 6 }, { name: 'dwarf', x: 6, y: 7 }, { name: 'dwarf', x: 1, y: 7 }],
  5: [{ name: 'dwarf', x: 5, y: 6 }, { name: 'dwarf', x: 6, y: 7 }, { name: 'dwarf', x: 1, y: 7 }]
};

export default {
  getTestingPlayerBoard: async boardID => {
    const board = await playerTestingBoards[boardID]();
    return board;
  },
  getSetRound: round => createBoard(roundSetConfiguration[round])
};

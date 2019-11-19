
import BattleUnit from '../objects/BattleUnit';

export default class AiPlayer {
  static roundSetConfiguration = {
    1: [{ name: 'dwarf', x: 0, y: 7 }],
    2: [{ name: 'dwarf', x: 5, y: 6 }, { name: 'dwarf_soldier', x: 6, y: 7 }],
    3: [{ name: 'dwarf_guard', x: 5, y: 6 }],
    4: [{ name: 'dwarf', x: 5, y: 6 }, { name: 'dwarf_guard', x: 6, y: 7 }, { name: 'dwarf', x: 1, y: 7 }],
    5: [{ name: 'dwarf', x: 5, y: 6 }, { name: 'dwarf_soldier', x: 6, y: 7 }, { name: 'dwarf_guard', x: 1, y: 7 }],
    6: [{ name: 'dwarf', x: 5, y: 6 }, { name: 'dwarf_soldier', x: 6, y: 7 }, { name: 'dwarf_guard', x: 1, y: 7 }, { name: 'elf', x: 2, y: 7 }]
  };

  public battleBoard:BattleUnit[] = [];

  constructor(round: number) {
    if (round > 6) {
      round = 6; // hardcode to cover rounds 6+ for now, until we have proper AI
    }

    const npcBoard = AiPlayer.roundSetConfiguration[round];
    npcBoard.forEach(simpleUnit => {
      this.battleBoard.push(new BattleUnit({
        name: simpleUnit.name,
        position: {
          x: simpleUnit.x,
          y: simpleUnit.y
        },
        teamId: 1
      }))
    });
  }
}
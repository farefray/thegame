import Battle from '../objects/Battle';

interface BattleResult {
  battleTime: number,
  actionStack: Array<Object>,
  startBoard: Object,
  winner: number,
  playerDamage: number
}

class BattleController {
  static async setupBattle (battleBoard: Object): Promise<BattleResult> {
    // TODO: Future: All battles calculate concurrently, structurize this object maybe
    // todo battle bonuses and so on here
    // Both players have units, battle required
    // todo async maybe and some good syntax
    const _battleResult = new Battle({ board: battleBoard });
    const { actionStack, startBoard, winner, playerDamage } = _battleResult;
    const battleResult: BattleResult = {
      actionStack: actionStack,
      startBoard: startBoard,
      winner: winner,
      playerDamage: playerDamage,
      battleTime: actionStack[actionStack.length - 1].time + 5000 // extra 5 seconds for network
    };

    return battleResult;
  }
}

export default BattleController;

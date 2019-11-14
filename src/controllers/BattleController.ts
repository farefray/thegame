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
    const results = {
      battleTime: 0,
      battles: {}
    };

    let battleTime = 0;

    // Both players have units, battle required
    // todo async maybe and some good syntax
    const _battleResult = new Battle({ board: battleBoard });
    const { actionStack, startBoard, winner, playerDamage } = _battleResult;
    const battleResult: BattleResult = {
      actionStack: actionStack,
      startBoard: startBoard,
      winner: winner,
      playerDamage: playerDamage
    };

    if (actionStack.length) {
      const playerBattleTime = actionStack[actionStack.length - 1].time;
      console.log("TCL: actionStack[actionStack.length - 1]", actionStack[actionStack.length - 1])
      if (playerBattleTime > battleTime) {
        battleTime = playerBattleTime;
      }
    }

    results.time = Number(battleTime) + 5000; // adding extra 2 seconds delay to cover network issues and final effects
    console.log("TCL:  results.battleTime", results.time)
    return battleResult;
  }
}

export default BattleController;

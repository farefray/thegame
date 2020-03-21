import Battle, { UnitAction, BattleResult } from '../objects/Battle';



class BattleController {
  /**
   * @description optimizes actionStack for frontend, formatting chained actions
   * @todo probably will require more optimizations for big actionStacks
   * @param actionStack <Array>Action
   */
  static optimizeActionStack(actionStack: Array<UnitAction>) {
    const uidMap = {};
    actionStack.forEach((action, index) => {
      if (action.uid) {
        uidMap[action.uid] = action;
        delete action.uid;
      }
    
      if (action.parent) {
        // We are chaining actions in order to execute them immediatly(after/in the middle) on frontend, instead of trusting our schedule
        uidMap[action.parent].chainedAction = action;
        // delete action.parent;
      }
    })
    
    let filteredActions = actionStack.filter(action => {
      return !action.parent;
    });

    return filteredActions.sort((a, b) => ((a.time > b.time) ? 1 : -1) );
  }

  static async setupBattle(battleBoard: Object): Promise<BattleResult> {
    // TODO: Future: All battles calculate concurrently, structurize this object maybe
    // todo battle bonuses and so on here
    // Both players have units, battle required
    // todo async maybe and some good syntax
    const _battleResult = new Battle({ board: battleBoard });
    const { actionStack, startBoard, winner } = _battleResult;

    const lastAction = actionStack[actionStack.length - 1];
    const battleResult: BattleResult = {
      actionStack: BattleController.optimizeActionStack(actionStack),
      startBoard: startBoard,
      winner: winner,
      battleTime: lastAction ? lastAction.time : 0
    };

    return battleResult;
  }
}

export default BattleController;

import Battle, { UnitAction, BattleResult } from '../objects/Battle';

class BattleController {
  /**
   * @description optimizes actionStack for frontend, formatting chained actions
   * @todo probably will require more optimizations for big actionStacks
   * @param actionStack <Array>Action
   */
  static optimizeActionStack(actionStack: Array<UnitAction>) {
    const uidMap = {};
    // building uidMap first
    actionStack.forEach((action, index) => {
      if (action.uid) {
        uidMap[action.uid] = action;
        // delete action.uid;
      }
    });

    actionStack.forEach((action, index) => {
      if (action.parent) {
        // We are chaining actions in order to execute them immediatly(after/in the middle) on frontend, instead of trusting our schedule
        try {
          if (!uidMap[action.parent]) {
            // TODO avoid such issues
            throw new Error('Stack optimization failed');
          }

          uidMap[action.parent].chainedAction = action;
        } catch (e) {
          // in case error happened, we remove parent reference (this is very bad, we need to fix this)
          console.warn('Wrong action parent during optimization!', JSON.parse(JSON.stringify((action))));
          delete action.parent;
        }
      }
    });

    const filteredActions = actionStack.filter(action => {
      return !action.parent;
    });

    return filteredActions.sort((a, b) => ((a.time > b.time) ? 1 : -1));
  }

  static async setupBattle(battleConfig): Promise<BattleResult> {
    // TODO: Future: All battles calculate concurrently, structurize this object maybe
    // todo battle bonuses and so on here
    // Both players have units, battle required
    // todo async maybe and some good syntax
    // performance.mark('battle_calc__start');
    const battle = new Battle(...battleConfig.boards);
    const { actionStack, startBoard, winner } = battle;

    const optimizedActionStack = BattleController.optimizeActionStack(actionStack);
    const lastAction = actionStack[actionStack.length - 1];
    const returnValue: BattleResult = {
      actionStack: optimizedActionStack,
      startBoard,
      winner,
      battleTime: lastAction ? lastAction.time : 0,
      participants: Object.values(battle[Symbol.for('owners')]), // ?
    };

    // performance.mark('battle_calc__done');
    // performance.measure("Time to calculate battle", 'battle_calc__start', 'battle_calc__done');
    // console.log(performance.getEntriesByType("measure")[0].name, performance.getEntriesByType("measure")[0].duration);
    // performance.clearMarks();
    // performance.clearMeasures();
    return returnValue; // todo P0 this is wrong function, async?
  }
}

export default BattleController;

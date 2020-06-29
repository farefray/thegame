import { Container } from 'typedi';
import Session from '../models/Session';
import { STATE } from '../shared/constants';
import Customer from '../models/Customer';
import EventBus from '../services/EventBus';
import { ABILITY_PHASE } from '../typings/Card';
import Battle, { BattleBoard } from '../structures/Battle';

export default class GameController {
  static async startGame(customers: Array<Customer>) {
    const session = new Session(customers);
    const state = session.getState();

    await state.wait(STATE.FIRST_ROUND_COUNTDOWN);

    while (session.hasNextRound()) {
      const players = state.getPlayersArray();

      if (players.length === 2) { // ? todo can be different or what?
        // players[0].beforeBattle(players[1]);
        // players[1].beforeBattle(players[0]);

        players.forEach((player) => {
          player.dealCards();
        })

        await state.wait(STATE.FIRST_ROUND_COUNTDOWN);
        state.playCards(ABILITY_PHASE.INSTANT);

        await state.wait(STATE.FIRST_ROUND_COUNTDOWN);

        // check if battle state is required
        if (state.firstPlayer.board.units().size > 0 || state.secondPlayer.board.units().size > 0) { // :(
          const battleBoards: Array<BattleBoard> = [];
          battleBoards.push({
            owner: state.firstPlayer.getUID(),
            units: state.firstPlayer.board.units()
          });

          battleBoards.push({
            owner: state.secondPlayer.getUID(),
            units: state.secondPlayer.board.reverse().units()
          });

          const battle = new Battle(battleBoards, [state.firstPlayer.getUID(), state.secondPlayer.getUID()]);
          await battle.proceedBattle();
        }
      }

      // const { winners, roundCountdown } = roundResults;

      await state.wait(15000); // todo

      state.endRound();

      await state.waitUntilNextRound();
    }
  }
}

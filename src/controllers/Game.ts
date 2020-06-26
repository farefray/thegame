import { Container } from 'typedi';
import Session from '../models/Session';
import { STATE } from '../shared/constants';
import Customer from '../models/Customer';
import EventBus from '../services/EventBus';

export default class GameController {
  static async startGame(customers: Array<Customer>) {
    const session = new Session(customers);
    const state = session.getState();

    await state.wait(STATE.FIRST_ROUND_COUNTDOWN);

    while (session.hasNextRound()) {
      await session.nextRound();
      // const { winners, roundCountdown } = roundResults;

      await state.wait(15000); // todo

      state.endRound();

      await state.waitUntilNextRound();
    }
  }
}

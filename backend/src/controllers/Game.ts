import { Container } from 'typedi';
import Session from '../models/Session';
import { EventEmitter } from 'events';
import { STATE } from '../shared/constants';
import Customer from '../models/Customer';
import { SocketID } from '../utils/types';

export default class GameController {
  static async startGame(customers: Array<Customer>) {
    const eventEmitter: EventEmitter = Container.get('event.emitter');
    const session = new Session(customers);
    const state = session.getState();

    const clients:Array<SocketID> = [];
    customers.forEach(customer => {
      clients.push(customer.getSocketID());

      // Update players, to notify them that they are in game and countdown till round start
      eventEmitter.emit('stateUpdate', customer.ID, state); // later there's overuse of getCustomer. Need to be fixed
    });

    await state.wait(STATE.FIRST_ROUND_COUNTDOWN);

    while (session.hasNextRound()) {
      const roundResults = await session.nextRound();
      const { battles, winners, roundCountdown } = roundResults;

      state.getPlayers().forEach((player) => {
        eventEmitter.emit('roundBattleStarted', player.getUID(), battles[0]); // this is a hotfix. TODO link battle to playerpair without participants property
      });

      await state.wait(roundCountdown);

      state.endRound(winners);

      state.getPlayers().forEach((player) => {
        eventEmitter.emit('stateUpdate', player.getUID(), state);
      });

      await state.waitUntilNextRound();
    }
  }
}

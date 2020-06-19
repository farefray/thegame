import { Container } from 'typedi';
import Session from '../objects/Session';
import { EventEmitter } from 'events';
import { STATE } from '../shared/constants';
import Customer from '../objects/Customer';
import { SocketID } from '../utils/types';


const GameService = {
  async startGame(customers: Array<Customer>) {
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

      for (const uid in state.players) {
        eventEmitter.emit('roundBattleStarted', uid, battles.filter(battle => battle.participants.includes(uid)).shift());
      }

      await state.wait(roundCountdown);

      state.endRound(winners);

      for (const uid in state.players) {
        eventEmitter.emit('stateUpdate', uid, state);
      }

      await state.waitUntilNextRound();
    }
  }
};

export default GameService;

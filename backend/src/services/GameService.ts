import { Container } from 'typedi';
import Session from '../objects/Session';
import { EventEmitter } from 'events';
import { SocketID } from '../utils/types';
import { STATE } from '../shared/constants';


const GameService = {
  async startGame(clients: Array<SocketID>) {
    const eventEmitter: EventEmitter = Container.get('event.emitter');

    const session = new Session(clients);

    // Update players, to notify them that they are in game and countdown till round start
    const state = session.getState();
    for (let index = 0; index < clients.length; index++) {
      eventEmitter.emit('stateUpdate', clients[index], state);
    }

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

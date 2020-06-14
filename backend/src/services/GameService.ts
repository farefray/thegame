import { Container } from 'typedi';
import Session from '../objects/Session';
import { EventEmitter } from 'events';
import ConnectedPlayers from '../singletons/ConnectedPlayers';
import { SocketID } from '../utils/types';

const connectedPlayers = ConnectedPlayers.getInstance();

const GameService = {
  startGame(clients: Array<SocketID>) {
    const eventEmitter: EventEmitter = Container.get('event.emitter');

    const session = new Session(clients);

    // Update players, to notify them that they are in game and countdown till round start
    const state = session.getState();
    console.log('start');
    for (let index = 0; index < clients.length; index++) {
      const socketID = clients[index];

      connectedPlayers.getBySocket(socketID)?.setToSession(session.getID());

      console.log('stateUpdate');
      eventEmitter.emit('stateUpdate', socketID, state);
    }

    console.log('startGameSession');
    GameService.startGameSession(session);
  },

  // todo This seems wrong. Need some better implementation, lets say using event emitted from SessionService
  startGameSession: async (session: Session) => {
    const eventEmitter: EventEmitter = Container.get('event.emitter');
    const state = session.getState();
    await state.scheduleNextRound();

    // TODO [P0] rounds going even if all disconnected!
    while (session.hasNextRound()) {
      // do we need to update our session from storage?? TODO Test
      const roundResults = await session.nextRound();
      const { battles } = roundResults;

      for (const uid in state.players) {
        eventEmitter.emit('roundBattleStarted', uid, battles.filter(battle => battle.participants.includes(uid)).shift());
      }

      await state.wait(roundResults.countdown); // this is a hotfix, has to be done better way

      eventEmitter.emit('stateUpdate', session.ID, state);
      await state.scheduleNextRound();
    }
  }
};

export default GameService;

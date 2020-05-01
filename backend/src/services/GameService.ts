import Session from '../objects/Session';

export default function GameService(dependencyContainer) {
  const Container = dependencyContainer;

  return {
    initGameSession: (clients) => {
      const session = new Session(clients);
      const sessionStore = Container.get('session.store');
      sessionStore.store(session);
      return session;
    },

    startGameSession: async (session: Session) => {
      const eventEmitter = Container.get('event.emitter');
      const state = session.getState();
      await state.scheduleNextRound();

      // TODO [P0] rounds going even if all disconnected!
      while (session.hasNextRound()) {
        // do we need to update our session from storage?? TODO Test
        const roundResults = await session.nextRound();
        const { battles } = roundResults;

        for (const uid in state.players) {
          eventEmitter.emit('roundBattleStarted', uid, battles.filter((battle) => battle.participants.includes(uid)).shift());
        }

        eventEmitter.emit('stateUpdate', session.ID, state);
        await state.scheduleNextRound();
      }
    },
  };
}

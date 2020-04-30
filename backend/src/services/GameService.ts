import Session from '../objects/Session';

export default function GameService(dependencyContainer) {
  const Container = dependencyContainer;

  return {
    initGameSession: (clients) => {
      const session = new Session(clients);
      Container.get("session.store").store(session);
      return session;
    },

    startGameSession: async (session: Session) => {
      const eventEmitter = Container.get('event.emitter');
      const state = session.getState();
      await state.scheduleNextRound();

      while (session.hasNextRound()) {
        // do we need to update our session from storage?? TODO Test
        const roundResults = await session.nextRound();
        const { battles } = roundResults;

        for (let uid in state.players) {
          eventEmitter.emit('roundBattleStarted', uid, battles.filter((battle) => battle.participants.includes(uid)).shift());
        }

        eventEmitter.emit('stateUpdate', session.ID, state);
        await state.scheduleNextRound();
      }
    }
  };
}

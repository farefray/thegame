import AppError from '../objects/AppError';
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
      const io = Container.get('io');
      while (session.hasNextRound()) {
        // do we need to update our session from storage?? TODO Test
        const roundResults = await session.nextRound();
        const { battleResults } = roundResults;
        const { state } = session;

        const winners:Array<string> = [];
        for (let uid in state.players) {
          const playerBattle = battleResults.filter((battleResult) => battleResult.participants.includes(uid)).shift();
          console.log("GameService -> playerBattle", playerBattle)
          playerBattle?.winner && winners.push(playerBattle.winner);
          io.to(uid).emit('START_BATTLE', playerBattle);
        }

        state.endRound(winners);

        io.to(session.ID).emit('UPDATED_STATE', state); // do we need to send whole state?

        await state.scheduleNextRound();
      }
    }
  };
}

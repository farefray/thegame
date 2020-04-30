import Player from '../objects/Player';
import State from '../objects/State';
import AppError from '../objects/AppError';
import AiPlayer from '../models/AiPlayer';
import Session from '../objects/Session';

const HAND_UNITS_LIMIT = 9;

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
    },

    purchasePawn: async (state, playerIndex, pieceIndex) => {
      const player = state.getIn(['players', playerIndex]);
      if (player.isDead()) {
        return new AppError('warning', "Sorry, you're already dead");
      }

      /**
       * Checks to be done:
       * unit exist in shop
       * hand is not full
       * can afford
       */
      const unit = player.shopUnits[pieceIndex];
      if (!unit || Object.keys(player.hand).length >= HAND_UNITS_LIMIT) {
        return new AppError('warning', 'Your hand is full');
      }

      if (player.gold < unit.cost) {
        return new AppError('warning', 'Not enough money');
      }

      /**
       * remove unit from shop
       * add unit to hand
       * remove gold
       * set player state
       */
      await player.addToHand(unit.name);
      delete player.shopUnits[pieceIndex];
      player.gold -= unit.cost;

      state.setIn(['players', playerIndex], player);
      return state;
    },
  };
}

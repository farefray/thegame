import React from 'react';
import BattleBoardWrapper from '@/App/ActiveGame/BattleBoardWrapper';
import BattleUnitList from '@/../../backend/src/structures/Battle/BattleUnitList';
import { centered } from './utils';
import { store, game } from './emulateState';
import WebSocketProvider from '@/socket.context';
import { StoreProvider } from 'easy-peasy';
import { MOCKED_CUSTOMER_UID } from './MockedEventBus';
import Position from '@/../../backend/src/shared/Position';
import MonstersFactory from '@/../../backend/src/factories/MonstersFactory';
import { GAME_PHASE } from '@/../../backend/src/typings/Game';
import Battle from '@/../../backend/src/structures/Battle';

async function emulateBattle() {
  const battleUnit = MonstersFactory.createBattleUnit('Beholder');
  battleUnit.rearrangeToPos(new Position(0, 0));
  const npcBoard = new BattleUnitList([battleUnit]);

  const secondTeamBattleUnit = MonstersFactory.createBattleUnit('Minotaur');
  secondTeamBattleUnit.rearrangeToPos(new Position(7, 7));
  const playerBoard = new BattleUnitList([secondTeamBattleUnit]);

  const battle = new Battle([
    { units: playerBoard, owner: MOCKED_CUSTOMER_UID },
    { units: npcBoard, owner: 'ai_player_1' }
  ]);

  await battle.proceedBattle();
  await game.gamePhase(GAME_PHASE.BATTLE, battle.battleTime);

  game.notifyBattleEnded();
}

export default <BattleTestSuite />;

function BattleTestSuite(props) {
  const injectedWS = {
    socket: {},
    emitMessage: (type, payload) => {
      console.log('BattleTestSuite -> type, payload?', type, payload);
    }
  };

  emulateBattle();

  return (
    <StoreProvider store={store}>
      <WebSocketProvider injectedWS={injectedWS}>
        <div>
          {centered(
            <div className="gameboard">
              <div className="gameboard-background"></div>
              <div className="gameboard-wrapper">
                <BattleBoardWrapper />
              </div>
            </div>
          , 920)}
        </div>
      </WebSocketProvider>
    </StoreProvider>
  );
}

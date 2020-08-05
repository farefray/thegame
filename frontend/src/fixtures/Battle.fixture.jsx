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
import { useValue } from 'react-cosmos/fixture';

function BattleTestSuite({ firstUnits, secondUnits }) {
  const [rendered] = useValue('rendered', { defaultValue: true });
  if (!rendered) {
    return <div />;
  }

  const injectedWS = {
    socket: {},
    emitMessage: (type, payload) => {
      console.log('BattleTestSuite -> type, payload?', type, payload);
    }
  };

  emulateBattle(firstUnits, secondUnits);

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


async function emulateBattle(firstUnits, secondUnits) {
  const npcBoard = [];
  let positionX = 0;
  firstUnits.forEach(unitName => {
    if (unitName && unitName !== '') {
      const battleUnit = MonstersFactory.createBattleUnit(unitName);
      battleUnit.rearrangeToPos(new Position(positionX++, 0));
      npcBoard.push(battleUnit);
    }
  });

  const playerBoard = [];
  let positionY = 0;
  secondUnits.forEach(unitName => {
    if (unitName && unitName !== '') {
      const secondTeamBattleUnit = MonstersFactory.createBattleUnit(unitName);
      secondTeamBattleUnit.rearrangeToPos(new Position(positionY++, 7));
      playerBoard.push(secondTeamBattleUnit);
    }
  });

  const battle = new Battle([
    { units: new BattleUnitList(playerBoard), owner: MOCKED_CUSTOMER_UID },
    { units: new BattleUnitList(npcBoard), owner: 'ai_player_1' }
  ]);

  await battle.proceedBattle();
  await game.gamePhase(GAME_PHASE.BATTLE, battle.battleTime);

  game.notifyBattleEnded();
}

export default <BattleTestSuite firstUnits={['Minotaur', '', '', '', '', '', '']} secondUnits={['Dwarf_Geomancer', '', '', '', '', '', '']}/>;

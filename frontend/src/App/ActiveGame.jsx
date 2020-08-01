import React from 'react';

import { Grid, Row, Col } from 'rsuite';
import { useStoreState } from 'easy-peasy';

// import PlayerStats from './ActiveGame/PlayerStats.jsx';
import BattleBoardWrapper from './ActiveGame/BattleBoardWrapper.jsx';

import Merchantry from './ActiveGame/Merchantry';
import PlayerBoardWrapper from './ActiveGame/PlayerBoardWrapper.jsx';
import Player from './ActiveGame/Player';
import GameSteps from './ActiveGame/GameSteps';
import Gold from './ActiveGame/Player/Gold';

function ActiveGame() {
  const isActiveBattleGoing = useStoreState((state) => state.gameboard.isActiveBattleGoing);
  const currentPlayerGold = useStoreState((state) => state.players.currentPlayer.gold);
  return (
    <Grid fluid>
      <Row>
        <Player isOpponent />
      </Row>
      <Row className="arena">
        <Col className="arena-leftbar">
          <Gold gold={currentPlayerGold}/>
          <GameSteps />
          <Gold gold={currentPlayerGold}/>
        </Col>
        <Col>
          <div className="gameboard">
          <div className="gameboard-background"></div>
            <div className="gameboard-wrapper">
              {isActiveBattleGoing ? <BattleBoardWrapper /> : <PlayerBoardWrapper />}
            </div>
          </div>
        </Col>
        <Col>
          <Merchantry />
        </Col>
      </Row>
      <Row>
        <Player />
      </Row>
    </Grid>
  );
}

export default ActiveGame;

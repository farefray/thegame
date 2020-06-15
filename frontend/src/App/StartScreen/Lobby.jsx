import React, { useContext } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { Divider, FlexboxGrid, Button, ButtonToolbar } from 'rsuite';
import { WebSocketContext } from '@/socket.context';

function Lobby() {
  const websocket = useContext(WebSocketContext);
  const { email, isReady } = useSelector(state => state.customer, shallowEqual);

  const handlePlayVsHuman = async () => {
    await websocket.emitMessage('PLAYER_READY');
  };

  const handlePlayVsAI = async () => {
    await websocket.emitMessage('START_AI_GAME');
  }

  return (
    <FlexboxGrid className="lobby">
      <FlexboxGrid.Item colspan={11} className="lobby-profile">
        Account: {email} <br />
        |TODO account information|
      </FlexboxGrid.Item>
      <FlexboxGrid.Item>
        <Divider vertical />
      </FlexboxGrid.Item>
      <FlexboxGrid.Item colspan={11} className="lobby-controls">
        <ButtonToolbar>
          {!isReady && <Button appearance="default" onClick={handlePlayVsAI}>
            Play vs AI
          </Button>}
          {isReady ? (
            <h2>Waiting for start</h2>
          ) : (
            <Button appearance="primary" onClick={handlePlayVsHuman}>
              Play vs Human
            </Button>
          )}
        </ButtonToolbar>
      </FlexboxGrid.Item>
    </FlexboxGrid>
  );
}

export default Lobby;

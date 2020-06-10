import React, { Component } from 'react';
import { Divider, FlexboxGrid, Button, ButtonToolbar } from 'rsuite';

class Lobby extends Component {
  constructor(props) {
    super(props);
  }

  handlePlayVsAI() {
    // ? DO we really need import socketConnector here? It seems like starting socket connection cuz of that(cosmos)
  }

  handlePlayVsHuman() {
  }

  render() {
    const { customer, isReady } = this.props;

    return (
      <FlexboxGrid className="lobby">
        <FlexboxGrid.Item colspan={11} className="lobby-profile">
          Account: {customer.email} <br />
          |TODO account information|
        </FlexboxGrid.Item>
        <FlexboxGrid.Item>
          <Divider vertical />
        </FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={11} className="lobby-controls">
          <ButtonToolbar>
            {!isReady && <Button appearance="default" onClick={this.handlePlayVsAI}>
              Play vs AI
            </Button>}
            {isReady ? (
              <h2>Waiting for start</h2>
            ) : (
              <Button appearance="primary" onClick={this.handlePlayVsHuman}>
                Play vs Human
              </Button>
            )}
          </ButtonToolbar>
        </FlexboxGrid.Item>
      </FlexboxGrid>
    );
  }
}

export default Lobby;

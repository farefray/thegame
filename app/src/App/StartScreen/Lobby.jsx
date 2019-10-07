import React, { Component } from 'react';
import { Divider, FlexboxGrid, Button, ButtonToolbar } from 'rsuite';
import FlexboxGridItem from 'rsuite/lib/FlexboxGrid/FlexboxGridItem';

class Lobby extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  handlePlayVsAI() {}

  handlePlayVsHuman() {}
  
  render() {
    const { customer } = this.props;

    return (
      <FlexboxGrid className="lobby">
        <FlexboxGrid.Item colspan={11} className="lobby-profile">
          Account: {customer.email}
          Level: 0 
          Active lootboxes: 0 
          Gold: 0
        </FlexboxGrid.Item>
        <FlexboxGrid.Item>
          <Divider vertical />
        </FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={11} className="lobby-controls">
        <ButtonToolbar>
          <Button appearance="default" onClick={this.handlePlayVsAI}>
            Play vs AI
          </Button>
          <Button appearance="primary" onClick={this.handlePlayVsHuman}>
            Play vs Human
          </Button>
        </ButtonToolbar>
        </FlexboxGrid.Item>
      </FlexboxGrid>
    );
  }
}

export default Lobby;

import React, { Component } from 'react';
import { FlexboxGrid } from 'rsuite';
import _ from 'lodash';
import ShopPawn from './RightSidebar/ShopPawn';
import { SocketConnector } from '@/socketConnector';

class RightSidebar extends Component {
  constructor(props) {
    super(props);

    this.state = { 
      shopUnits: props.shopUnits
    };
  }

  static getDerivedStateFromProps(props, current_state) {
    if (!_.isEqual(current_state.shopUnits, props.shopUnits)) {
      return {
        shopUnits: props.shopUnits
      }
    }

    return null
  }

  onPurchase(unitIndex) {
    SocketConnector.purchaseUnit(unitIndex); // shall we validate it on frontend at least just a lil bit? TODO
  }

  render() {
    const { shopUnits:pawns } = this.state;
    return (
      <FlexboxGrid align="middle" justify="center" className="rightsidebar">
        <FlexboxGrid.Item colspan={24} className="rightsidebar-shop">
          {Object.keys(pawns).map((index) => {
            const unit = pawns[index];
            return <ShopPawn key={index} unit={unit} index={index} onPurchase={this.onPurchase} />;
          })}
        </FlexboxGrid.Item>
      </FlexboxGrid>
    );

  }
}

export default RightSidebar;

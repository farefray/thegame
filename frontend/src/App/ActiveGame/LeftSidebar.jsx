import React, { Component } from 'react';
import { FlexboxGrid } from 'rsuite';
import _ from 'lodash';
import ShopPawn from './RightSidebar/ShopPawn';
import { SocketConnector } from '@/socketConnector';

class Sidebar extends Component {
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
    SocketConnector.purchaseUnit(unitIndex); // ! shall we validate it on frontend at least just a lil bit? TODO
  }

  render() {
    const { shopUnits } = this.state;
    return (
      <FlexboxGrid align="middle" justify="center" className="rightsidebar">
        <FlexboxGrid.Item colspan={24} className="rightsidebar-shop">
          {shopUnits.map((unit, index) => {
            return unit ? <ShopPawn key={index} unit={unit} index={index} onPurchase={this.onPurchase} /> : <React.Fragment key={index}/>;
          })}
        </FlexboxGrid.Item>
      </FlexboxGrid>
    );

  }
}

export default Sidebar;

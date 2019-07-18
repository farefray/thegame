import React, {
  Component
} from 'react';

import { buyUnitEvent, getStatsEvent } from '../events';
import { isUndefined, updateMessage } from '../f';
import { getImage, getTypeImg, getGymImage } from '../images.js';
import PawnImage from './PawnImage';

class ShopPawn extends Component{

  handleInfoPress = (event) => {
    event.stopPropagation();
    const prop = this.props.newProps;
    console.log('Pressed info shop', this.props.ShopPawn.name)
    prop.dispatch({ type: 'SELECT_SHOP_INFO', name: this.props.ShopPawn.name});
    getStatsEvent(prop, this.props.ShopPawn.name);
  }

  render(){
    let content;
    if(!isUndefined(this.props.ShopPawn)){
      const costColorClass = (!isUndefined(this.props.ShopPawn) ? 'costColor' + this.props.ShopPawn.cost : '')
      const costColorTextClass = (!isUndefined(this.props.ShopPawn) ? 'costColorText' + this.props.ShopPawn.cost : '')
      /*
      const backgroundColor = (Array.isArray(this.props.ShopPawn.type) ? 
            this.props.ShopPawn.type[0] : this.props.ShopPawn.type);
      */
      content = <div>
        <div className={`PawnImageDiv`}>
          <div className='pawnInfo'>
            <img className='infoImg' src={getImage('info')} onClick={this.handleInfoPress} alt={'info' + this.props.ShopPawn.name}/>
            <div className='infoImgBg'/>
          </div>
          {(this.props.ShopPawn.reqEvolve ? <div className='pokemonBaby'>
            <img className='babyImg' src={getImage('baby')} alt={'baby' + this.props.ShopPawn.name}/>
          </div> : '')}
          <PawnImage name={this.props.ShopPawn.name} sideLength={85} renderBase={costColorClass} newProps={this.props.newProps}/>
        </div>
        <div className='pokemonShopText'>
          <span className={costColorTextClass}>{this.props.ShopPawn.displayName + '\n'}</span>
          {(Array.isArray(this.props.ShopPawn.type) ?
            <div>
              <span className={`type typeLeft ${this.props.ShopPawn.type[0]}`}>{this.props.ShopPawn.type[0]}</span>
              <span className={`type ${this.props.ShopPawn.type[1]}`}>{this.props.ShopPawn.type[1] + '\n'}</span>
            </div>
            : <span className={`type ${this.props.ShopPawn.type}`}>{this.props.ShopPawn.type + '\n'}</span>)}
          {<span className={(this.props.newProps.gold < this.props.ShopPawn.cost ? 'redFont' : '')}>
            {<span>
              <img className='goldImageShop' style={{paddingLeft: '0px', marginLeft: '0px'}} src={getImage('goldCoin')} alt='goldCoin'/>
            </span>}
            <span className='shopCostText'>{/*'$' + */this.props.ShopPawn.cost}</span>
          </span>}
        </div>
      </div>
    } else {
      content = <div className={`pokemonShopEmpty text_shadow`}>Empty</div>;
    }
    return (
      <div className={`pokemonShopEntity ${(this.props.className ? this.props.className : '')}`} onClick={() => buyUnitEvent(this.props, this.props.index)}>
        {content}
      </div>
    );
  }
}

export default ShopPawn;
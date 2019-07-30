import React from 'react'

export default function PawnStats ({ position, name, direction, classList, newProps, isBoard }) {
  return <>
    TODO
  </>
}

/*

// (Math.min(pokemon.hp, pokemon.maxHp) / Math.max(pokemon.hp, pokemon.maxHp) * 100)
if (pokemon) {
  // (pokemon.hp + pokemon.hp-pokemon.maxHp / Math.max(pokemon.hp, pokemon.maxHp) * 100);
  const percHp = (Math.min(pokemon.hp, pokemon.maxHp) / pokemon.startHp) * 100; // (pokemon.hp > pokemon.maxHp ? (1 - ((pokemon.hp - pokemon.startHp) / pokemon.startHp)) : (pokemon.hp / pokemon.maxHp)) * 100;// ;
  const percShield = (pokemon.hp > pokemon.maxHp ? (pokemon.hp - pokemon.maxHp) / pokemon.startHp * 100 : 0); // (pokemon.hp > pokemon.maxHp ? ((pokemon.hp - pokemon.startHp) / pokemon.startHp) * 100 : 0);
  const shieldMarginLeft = ((percHp / 100.0) * sideLength) - 2; // - 13);
  const hpBar = <div className='barContainer' style={{ width: sideLength }}>
      <p className='hpText text_shadow'>
          {`${pokemon.hp}/${pokemon.startHp}`}
      </p>
      <div color={pokemon.team} className={`hpBar ${percShield > 0 ? 'barBorderShield' : 'barBorderNormal'}`} style={{ width: percHp + '%' }} />
      {(percShield > 0 ? <div className='shieldBar' style={{ width: percShield + '%', marginLeft: shieldMarginLeft + 'px' }} /> : '')}
  </div>;
  /*<div className={`hpBar  ${(pokemon.team === 0 ? 'friendlyBar' : 'enemyBar')}`} 
      style={{width: (pokemon.hp / Math.max(pokemon.hp, pokemon.maxHp) * 100)+'%'}}>*/
  /*(pokemon.hp > pokemon.maxHp ? <div className={`boostBar text_shadow ${(this.props.isBoard ? 'boostBar' : '')}`} 
    style={{width: (pokemon.hp-pokemon.maxHp / pokemon.hp1 * 100)+'%'}}/> : '')} 
  </div> : '')/
  const manaBar = <div className={`barDiv ${(pokemon.mana === 0 ? 'hidden' : '')}`} style={{ width: sideLength }}>
      <p className='manaText text_shadow'>
          {`${pokemon.mana}/${pokemon.manaCost}`}
      </p>
      <div className={`manaBar text_shadow
          ${(pokemon.mana >= pokemon.manaCost ? 'colorPurple' : '')}`} style={{ width: (pokemon.mana / pokemon.manaCost * 100) + '%' }} />
  </div>;
  const actionMessage = (pokemon.actionMessage && pokemon.actionMessage !== '' ?
      <div className={`text_shadow actionMessage ${(pokemon.actionMessage.split(' ').length > 2 ? 'actionMessagePadding' : '')}`} style={{ position: 'absolute' }}>
          {pokemon.actionMessage}
      </div>
      : '');
  let styleVar = { position: 'relative' };
  if (pokemon.animateMove) {
      styleVar = pokemon.animateMove;
      // console.log('StyleVar', pokemon.name, styleVar)
  }

  const back = (this.props.isBoard ? (!isUndefined(pokemon.team) ? pokemon.team === 0 : true) : false);
  const classList = `absolute ${(pokemon.winningAnimation ? ' winningAnimation' : (pokemon.attackAnimation ? ' ' + pokemon.attackAnimation : ''))} ` +
      `${(this.props.newProps.isActiveBattleGoing && !this.props.isBoard ? 'pawnEnter' : '')}`;
  // console.log('@rendereding PawnImage classList', classList)

  return <div className={`relative`} style={styleVar}>
      <Pawn position={this.state.pos} name={pokemon.name} direction={back ? 1 : 3} sideLength={sideLength} classList={classList} newProps={this.props.newProps} isBoard={this.props.isBoard} />
      {hpBar}
      {manaBar}
      {actionMessage}
  </div>
}


let buffs = '';
if (this.props.isBoard) {
  let pokemonBuffList = [];
  if (pokemon && pokemon.buff && pokemon.buff.length > 0) {
      // console.log('@stuff', pokemonBuffList, pokemon.buff.length)
      for (let i = 0; i < pokemon.buff.length; i++) {
          pokemonBuffList.push(<span key={'buff' + pokemon.buff[i]}>{pokemon.buff[i] + '\n'}</span>);
      }
  }
  buffs = (pokemon && pokemon.buff && pokemon.buff.length > 0 ? <div className='text_shadow textList buffText'>Buffed: {pokemonBuffList}</div> : '');
}

{buffs}
*/
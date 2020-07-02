import React from 'react';
import classNames from 'classnames';
import Card from './Merchantry/Card.jsx';

function Player({ player = {}, isOpponent = false }) {
  const { hand } = player;

  const classes = classNames('player', {
    'm-opponent': isOpponent
  });

  return (
    <div className={classes}>
      {' '}
      My hand:
      {hand && hand.map((card, index) => <Card key={index} card={card} />)}
    </div>
  );
}

export default Player;

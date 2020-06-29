import React from 'react';
import PropTypes from 'prop-types';
import Card from './Merchantry/Card.jsx';

PlayerHand.propTypes = {
  hand: PropTypes.arrayOf(PropTypes.object)
};

function PlayerHand({ hand }) {
  return (
    <div> My hand:
      {hand.map((card, index) => (
        <Card key={index} card={card} />
      ))}
    </div>
  );
}

export default PlayerHand;

import React, { useState, useEffect } from 'react';
import { useTransition, a } from 'react-spring';
import { getRandomArbitrary } from '@/utils/misc';
import anyPlayerContextConsumer from '../anyplayer.context';

interface Coin {
  key: string;
}

const GoldCoin = () => <div className="gold-coin" />;

function GoldCoins({ amount = 0, isOpponent }) {
  const generateCoins = (count) => {
    const coins: Array<Coin> = [];
    for (let index = 0; index < count; index++) {
      coins.push({
        key: (isOpponent ? 'o' : 'p') + index
      });
    }

    return coins;
  };

  const [coins, update] = useState(generateCoins(amount));

  useEffect(() => {
    update(generateCoins(amount));
  }, [amount]);

  const transition = useTransition(coins, {
    keys: (coins) => coins.key,
    from: (coins, i) => ({
      y: -64,
      // opacity: 0
    }),
    enter: (coin, i) => {
      return ({
        x: getRandomArbitrary(-30, 30),
        y: getRandomArbitrary(-30, 30),
        // opacity: 1, // Currently bugged in react-spring
        delay: 150 * i
      });
    },
    leave: (coin, i) => ({
      x: -100,
      // opacity: 0
    })
  });

  return (
    <div className={'gold ' + (isOpponent && 'm-opponent')}>
      {amount < 5 || <div className='gold-amount'>({amount} coin{amount === 1 || 's'})</div>}
      {transition((style, coin, t, i) => (
        <a.div style={style}>
          <GoldCoin />
        </a.div>
      ))}
    </div>
  );
}

function Gold({ isOpponent = false }) {
  return anyPlayerContextConsumer(isOpponent, (anyPlayer) => {
    return <GoldCoins amount={anyPlayer.gold} isOpponent={isOpponent} />;
  });
}

export default Gold;

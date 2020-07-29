import React, { useState, useRef, useEffect } from 'react';
import CardComponent from '@/components/Card';
import { useTransition, animated, Transition } from 'react-spring';
import { getRandomArbitrary } from '@/utils/misc';
import CardAnimation from 'components/Card/CardAnimation';

function Deck({ cards }) {
  const [items, updateDeck] = useState(cards);

  useEffect(() => {
    console.log('effect cards changed')
    updateDeck(cards);
  }, [cards])

  console.log('deck rendered')
  return (
    <div className="deck">
      <div className="deck-size">{cards.length}</div>
      {items.map((itemZ, index) => {
        return (
          <Transition
            items={itemZ}
            keys={item => item.uuid}
            from={{ transform: 'translate3d(0,-40px,0)', opacity: 0 }}
            enter={{ transform: 'translate3d(0, 0px, 0)', opacity: 1 }}
            leave={{ transform: 'translate3d(0,-40px,0)', opacity: 0 }}>
            {(values, item) => (
              <animated.div style={values}>
                <CardAnimation stackPosition={index} key={item.uuid}>
                  <CardComponent card={item} key={item.uuid || index} revealed={!!item.name} />
                </CardAnimation>
              </animated.div>
            )}
          </Transition>

        );
      })}
    </div>
  );

  /* {transitions.map((item, index) => {
      console.log("Deck -> index", index)
      console.log("Deck -> item", item)
        return (
          <animated.div key={index}>
            {
              <CardComponent
                key={index}
                card={items[index]}
                revealed={!!items[index].name}
                rest={{
                  stackPosition: index
                }}
              />
            }
          </animated.div>
        );
      })} */
}

export default Deck;

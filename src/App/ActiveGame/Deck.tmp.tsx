import React, { useState, useRef, useEffect } from 'react';
import CardComponent from '@/components/Card';
import { useTransition, animated } from 'react-spring';
import { useMount } from 'react-use';

const DeckContainer = ({ children }) => <div className="deck">{children}</div>;
/* <div className="deck-size">{cards.length}</div> */

function Deck({ cards = [] }: { cards: any[] }) {
  const [items, set] = useState(cards);

  const cardsRef = useRef([] as any[]);
  const transition = useTransition(cardsRef.current, {
    initial: { transform: 'translate3d(0, 0, 0)' },
    from: { transform: 'translate3d(0, -400px, 0)' },
    enter: { transform: 'translate3d(0, 0, 0)' },
    leave: { transform: 'translate3d(300px, 0, 0)' }
  });

  useEffect(() => {
    cardsRef.current = [...cards];
  }, [cards]);

  // Call the function to render your items.
  // The "values" argument is just like what "useSpring" returns.
  // The "item" argument is the item being transitioned.
  return (
    <DeckContainer>
      {transition((values, item: any) => {
        return (
          <animated.div style={values} key={item.uuid}>
            <CardComponent
              card={item}
              key={item.uuid}
              revealed={!!item.name}
              rest={{
                stackPosition: 0
              }}
            />
          </animated.div>
        );
      })}
    </DeckContainer>
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

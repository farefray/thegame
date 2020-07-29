import React, { useState, useRef, useEffect } from 'react';
import CardComponent from '@/components/Card';
import CardAnimation from 'components/Card/CardAnimation';

const DeckContainer = ({ children }) => <div className="deck">{children}</div>;

function Deck({ cards = [] }: { cards: any[] }) {
  const [items, set] = useState([...cards]);
  console.log("Deck -> items", items)
  // const cardsRef = useRef(cards);
  // useEffect(() => {
  //   cardsRef.current = [...cards];
  // }, [cards]);

  return (
    <DeckContainer>
      <div className="deck-size">{cards.length}</div>
      {items.map((item, index) => {
        console.log("Deck -> index", index)
        console.log("Deck -> item", item)
        return (
          <CardAnimation stackPosition={index} key={item.uuid || index}>
            <CardComponent card={item} key={item.uuid || index} revealed={!!item.name} />
          </CardAnimation>
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

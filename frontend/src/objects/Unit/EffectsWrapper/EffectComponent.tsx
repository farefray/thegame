import React from 'react';

/**
 * * P0 investigate and fix this
 * ! it ends up calling a lot of constructors for this function, even with very few effects on the board.
 * This has to be reworked, in scoupe of assets preloading
 * TODO
 */
export default function EffectComponent({ instance, onDone }) {
  const [imageSrc] = React.useState(require(`../../../assets/effects/${instance.lookType}.gif`));
  const ref = React.useRef<HTMLImageElement>(null);

  const { id, duration, from } = instance;
  console.log("EffectComponent -> instance", instance)

  React.useEffect(() => {
    setTimeout(() => {
      onDone(id);
    }, duration)
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // we need to absolutely place our particles based on their dims if its too small
  /** TODO make it appear based on position 'from' */
  return (
    <img
      ref={ref}
      style={{
        transform: `translate(${from.left + 32}px, ${from.top + 32}px)`,
      }}
      className="effect"
      src={imageSrc}
      alt=""
    />
  );
}

import React from 'react';

export default function Effect({ instance, onDone }) {
  const [imageSrc] = React.useState(require(`../../../assets/effects/${instance.lookType}.gif`));
  const { height:dims } = imageSrc;
  const ref = React.useRef<HTMLImageElement>(null);

  const { id, duration } = instance;

  React.useEffect(() => {
    setTimeout(() => {
      onDone(id);
    }, duration)
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // we need to absolutely place our particles based on their dims if its too small
  const posCorrection = {
    top: `${dims === 32 ? 32 : 0}px`,
    left: `${dims === 32 ? 32 : 0}px`
  };

  return (
    <img
      ref={ref}
      style={{...posCorrection}}
      className="effect"
      src={imageSrc}
      alt=""
    />
  );
}

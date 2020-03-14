import React from 'react';
import { BaseEffect, BaseEffectType } from './BaseEffect';

type EffectType = BaseEffectType & {
    lookType: string;
}

export class Effect extends BaseEffect implements EffectType {
    public lookType: string;

    constructor (econfig: EffectType) {
        super(econfig);

        this.lookType = econfig.id;
    }
}

export function EffectComponent({ instance, onDone }) {
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

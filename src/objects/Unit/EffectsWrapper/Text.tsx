import React from 'react';
import { BaseEffect, BaseEffectType } from './BaseEffect';

type TextType = BaseEffectType & {
    text: string;
    speed?: number;
    classes?: string;
}

export class Text extends BaseEffect implements TextType {
    public text: string;
    public speed?: number;
    public classes?: string;

    constructor (econfig: TextType) {
        super(econfig);

        this.text = econfig.text;
        this.speed = econfig.speed || 750;
        this.classes = econfig.classes;
    }
}

export function TextComponent({ instance, onDone }) {
  const ref = React.useRef<HTMLImageElement>(null);

  const { id, text, speed, classes } = instance;

  React.useEffect(() => {
    setTimeout(() => {
      if (!ref || !ref.current) {
        return;
      }

      ref.current.animate({
        transform: [
          `translate(0px, 0px)`,
          `translate(0px, -30px)`
        ],
      }, {
        direction: 'normal',
        duration: speed,
        delay: 0,
        easing: 'cubic-bezier(0.42, 0, 0.58, 1)',
      }).onfinish = () => {
        onDone(id)
      };
    }, 0)
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={ref}
      style={{
        transform: `translate(0px, 0px)`
      }}
      className={`animated-text ${classes}`}>
        {text}
    </div>
  );
}

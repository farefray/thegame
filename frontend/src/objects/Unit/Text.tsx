import React from 'react';

export default function Text({ instance, onDone }) {
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

import React from 'react';

export default function Particle({ particle }) {
  const [imageSrc] = React.useState(require(`../../assets/particles/${particle.lookType}.gif`));
  const [dimensions, setDimensions] = React.useState(null);

  const ref = React.useRef(null);

  // rotation
  const radians = Math.atan2(particle.to.top, particle.to.left); // angle between 2 poi ts
  const degrees = (radians * 180 / Math.PI) + 90; // + 90 because all particles are N oriented by default

  React.useEffect(() => {
    // destination
    if (dimensions) {
      let top = particle.to.top; // >0 = moving down
      //top = top > 0 ? top + dimensions : top - dimensions; // magic to make it hit into sprite [fixme]
      let left = particle.to.left; // >0 = moving right
      //left = left > 0 ? left + dimensions : left - dimensions; // magic to make it hit into sprite [fixme]
      
      ref.current.animate({
        transform: [
          `translate(0px, 0px) rotate(${degrees}deg)`,
          `translate(${left}px, ${top}px) rotate(${degrees}deg)`
        ],
      }, {
        direction: 'normal',
        duration: particle.speed,
        iterations: 1,
      }).onfinish = () => {
        particle.onDone(particle.id)
      };
    }
  }, [particle, dimensions]);

  const onImgLoad = ({target:img}) => {
    setDimensions(img.width);
  };
  
  return (
    <img
      ref={ref}
      style={{
        transform: `translate(0px, 0px) rotate(${degrees}deg)`,
      }}
      onLoad={onImgLoad}
      className="particle"
      src={imageSrc}
    />
  );
}

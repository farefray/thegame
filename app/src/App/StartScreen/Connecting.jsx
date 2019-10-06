import React, { useEffect } from 'react';
import Sandglass from '../../UI/res/misc/sandglass.png';

const singleDot = '.';
function Connecting() {
  const [dots, setDots] = React.useState([singleDot]);
  useEffect(() => {
    let id = setTimeout(() => {
      setDots((dots.length >= 3) ? [singleDot] : [...dots, singleDot])
    }, 1000);

    return () => {
      return id && clearTimeout(id);
    };
  }, [dots]);

  return (
    <div className="startscreen-loading">
      <img src={Sandglass} alt="Loading" className="startscreen-loading__image" />
      <h3>Trying to connect {dots.join('')}</h3>
    </div>
  );
}

export default Connecting;

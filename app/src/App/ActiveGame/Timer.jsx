import React, { useState, useEffect, useRef } from 'react';

function Timer ({ initialValue }) {
  const [count, setCount] = useState(initialValue);
  const [active, setActive] = useState(initialValue > 0);

  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = () => {
      setCount(count - 1);
    };
  });

  useEffect(() => {
    function tick () {
      savedCallback.current();
    }

    let id;
    if (active) {
      id = setInterval(tick, 1000);
    }

    return () => {
      return id && clearInterval(id)
    };
  }, [active]);

  if (count <= 0 && active) {
    setActive(false);
  }

  return <div className='timerDiv'>
    <div className='text_shadow timerText'>{count}</div>
  </div>;
}

export default Timer;

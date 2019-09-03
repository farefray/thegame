import React, { useEffect } from 'react';

function Timer({ value, onTick }) {
  useEffect(() => {
    let id = setTimeout(() => {
      onTick(value - 1);
    }, 1000);

    return () => {
      return id && clearTimeout(id);
    };
  }, [value, onTick]);

  return (
    <div className="timerDiv">
      <div className="text_shadow timerText">{value}</div>
    </div>
  );
}

export default Timer;

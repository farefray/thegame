import React, { useEffect } from 'react';

function InternalTimer({ value, onTick }) {
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

function Timer({ value }) {
  const [counter, setCounter] = React.useState(value);
  useEffect(() => {
    setCounter(value);
  }, [value]);

  const MemoizedTimer = React.useMemo(
    () => (
      <InternalTimer
        value={counter}
        onTick={val => {
          setCounter(val);
        }}
      />
    ),
    [counter]
  );

  return (counter ? MemoizedTimer : '');
}

export default Timer;

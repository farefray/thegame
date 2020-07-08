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

  return value;
}

function Timer({ initialTimerValue }) {
  const [counter, setCounter] = React.useState(initialTimerValue);
  useEffect(() => {
    setCounter(initialTimerValue);
  }, [initialTimerValue]);

  const MemoizedTimer = React.useMemo(
    () => (
      <InternalTimer
        value={counter}
        onTick={(val) => {
          setCounter(val);
        }}
      />
    ),
    [counter]
  );

  return (
    counter ? <div className="timer">{MemoizedTimer}</div> : null
  );
}

export default Timer;

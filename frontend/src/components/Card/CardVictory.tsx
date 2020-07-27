import React from 'react';

export default function CardVictory({ config }) {
  return (
    <div className="frame-victory">
      Victory:
      {config && Object.keys(config).map((key, i) => <div key={i}>{config[key]} {key}</div>)}
    </div>
  );
}

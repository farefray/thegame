import React from 'react';

export default function CardVictory({ config }) {
  return (
    <div className="frame-victory">
      {config && Object.keys(config).map((key, i) => <div key={i}>{key}:{config[key]}</div>)}
    </div>
  );
}

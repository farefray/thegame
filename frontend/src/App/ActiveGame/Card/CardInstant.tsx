import React from 'react';

export default function CardInstant({ config }) {
  return (
    <div className="frame-instant">
      {config && Object.keys(config).map((key, i) => <div key={i}>{key}:{config[key]}</div>)}
    </div>
  );
}

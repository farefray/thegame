import React from 'react';

export default function CardInstant({ config }) {
  return (
    <div className="frame-instant">
      Instant:
      {config && Object.keys(config).map((key, i) => <div key={i}>{config[key]} {key}</div>)}
    </div>
  );
}

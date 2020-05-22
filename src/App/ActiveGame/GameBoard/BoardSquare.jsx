import React from 'react';

export default function BoardSquare({ cellPosition, children }) {
  const baseClass = 'cell';

  return (
    <div className={baseClass}>
      {children}
    </div>
  );
}

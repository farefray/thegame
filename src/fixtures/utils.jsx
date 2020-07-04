import React from 'react';

export function centered(children) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '400px'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        {children}{' '}
      </div>
    </div>
  );
}

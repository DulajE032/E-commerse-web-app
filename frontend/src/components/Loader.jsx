"use client";
import React from 'react';

const Loader = ({
  size = 48,
  dotSize = 8,
  border = 3,
  className = '',
  label = 'Loading',
}) => {
  const gap = Number.isFinite(dotSize) ? dotSize : 8;
  const gap2 = gap * 2;

  return (
    <span
      role="status"
      aria-label={label}
      className={`loader ${className}`.trim()}
      style={{
        '--loader-size': `${size}px`,
        '--loader-border': `${border}px`,
        '--loader-gap': `${gap}px`,
        '--loader-gap-2': `${gap2}px`,
      }}
    />
  );
};

export default Loader;

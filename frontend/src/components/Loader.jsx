import React from 'react';

const Loader = ({
  size = 80,
  dotSize = 20,
  border = 10,
  className = '',
  label = 'Loading',
}) => (
  <div
    role="status"
    aria-label={label}
    className={`loader ${className}`.trim()}
    style={{
      '--loader-size': `${size}px`,
      '--loader-dot': `${dotSize}px`,
      '--loader-border': `${border}px`,
    }}
  />
);

export default Loader;

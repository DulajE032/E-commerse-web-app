import React, { useState } from 'react';

const ImageMagnifier = ({ src, alt }) => {
  // Memory 1: Remember the mouse's X and Y position (in percentages)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // Memory 2: Remember if the mouse is touching the image
  const [showMagnifier, setShowMagnifier] = useState(false);

  // The Action: What happens when the mouse moves?
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    
    // Calculate where the mouse is relative to the box (from 0% to 100%)
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    
    setPosition({ x, y });
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden rounded-2xl cursor-zoom-in"
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
    >
      <img 
        src={src} 
        alt={alt} 
        className={`w-full h-full object-contain mix-blend-multiply transition-transform duration-200 ${
          showMagnifier ? 'scale-[2.5]' : 'scale-75'
        }`}
        style={{
          // This is the magic! It tells the zoom to center exactly where the mouse is.
          transformOrigin: showMagnifier ? `${position.x}% ${position.y}%` : 'center center'
        }}
      />
    </div>
  );
};

export default ImageMagnifier;
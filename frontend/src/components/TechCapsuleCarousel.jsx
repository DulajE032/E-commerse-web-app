"use client";
import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './TechCapsuleCarousel.css';

const showcaseItems = [
  {
    id: 'robot-arena',
    image: '/assets/images/robotics/robot-arena.png',
    alt: 'Robotics Arena Competition'
  },
  {
    id: 'robot-sensors',
    image: '/assets/images/robotics/robot-sensors.png',
    alt: 'Sensor Array & Motor System'
  },
  {
    id: 'robot-blueprint',
    image: '/assets/images/robotics/robot-blueprint.png',
    alt: 'Autonomous Controller & Wiring Layout'
  },
  {
    id: 'robot-track',
    image: '/assets/images/robotics/robot-track.png',
    alt: 'High-Speed Line Follower on Test Track'
  },
  {
    id: 'robot-chassis',
    image: '/assets/images/robotics/robot-chassis.png',
    alt: 'Precision Engineered Chassis'
  }
];

const TechCapsuleCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(2); // Center item is active initially

  const handleCardClick = (index) => {
    setActiveIndex(index);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % showcaseItems.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + showcaseItems.length) % showcaseItems.length);
  };

  const getCardClass = (index) => {
    const diff = (index - activeIndex + showcaseItems.length) % showcaseItems.length;
    
    if (diff === 0) return 'active';
    if (diff === 1) return 'right';
    if (diff === 2) return 'right-2';
    if (diff === showcaseItems.length - 1) return 'left';
    if (diff === showcaseItems.length - 2) return 'left-2';
    
    return 'hidden';
  };

  return (
    <div className="tech-capsule-container">
      <div className="carousel-wrapper">
        <button className="nav-btn prev-btn" onClick={handlePrev} aria-label="Previous">
          <FiChevronLeft size={24} />
        </button>
        
        <div className="tech-capsule-track">
          {showcaseItems.map((item, index) => (
            <div
              key={item.id}
              className={`tech-card ${getCardClass(index)}`}
              onClick={() => handleCardClick(index)}
              title={item.alt}
            >
              <img 
                src={item.image} 
                alt={item.alt} 
                className="tech-card-full-image" 
              />
              <div className="tech-card-glass-shine" />
            </div>
          ))}
        </div>

        <button className="nav-btn next-btn" onClick={handleNext} aria-label="Next">
          <FiChevronRight size={24} />
        </button>
      </div>

      <div className="pagination">
        {showcaseItems.map((_, idx) => (
          <div 
            key={idx} 
            className={`dot ${idx === activeIndex ? 'active' : ''}`}
            onClick={() => handleCardClick(idx)}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TechCapsuleCarousel;

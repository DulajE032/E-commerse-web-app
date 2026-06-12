"use client";
import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './TechCapsuleCarousel.css';

const products = [
  {
    id: 'calculator-subnet',
    title: 'Subnet Calculator',
    desc: 'Accurately calculate subnet masks, IP ranges, and network details.',
    badge: 'Network',
    image: '/assets/images/headphones.png', // Reusing placeholder
    price: 'Free'
  },
  {
    id: 'calculator-resistor',
    title: 'Resistor Color Code Calculator',
    desc: 'Easy online free tool for calculations of resistance values of resistors.',
    badge: 'Electronics',
    image: '/assets/images/iphone_case.png', // Reusing placeholder
    price: 'Free'
  },
  {
    id: 'calculator-wire',
    title: 'Wire Gauge Calculator',
    desc: 'Calculate the wire gauge size for electrical wiring based on the wire diameter.',
    badge: 'Electrical',
    image: '/assets/images/earbuds.png', // Reusing placeholder
    price: 'Free'
  },
  {
    id: 'calculator-power',
    title: 'Power Calculator',
    desc: 'Easily calculate power, voltage, current and resistance.',
    badge: 'Physics',
    image: '/assets/images/headphones.png', // Reusing placeholder
    price: 'Free'
  },
  {
    id: 'calculator-ohm',
    title: 'Ohm\'s Law Calculator',
    desc: 'Calculate the relationships between voltage, current, and resistance.',
    badge: 'Physics',
    image: '/assets/images/iphone_case.png', // Reusing placeholder
    price: 'Free'
  }
];

const TechCapsuleCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(2); // Center item is active initially

  const handleCardClick = (index) => {
    setActiveIndex(index);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % products.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const getCardClass = (index) => {
    const diff = (index - activeIndex + products.length) % products.length;
    
    if (diff === 0) return 'active';
    if (diff === 1) return 'right';
    if (diff === 2) return 'right-2';
    if (diff === products.length - 1) return 'left';
    if (diff === products.length - 2) return 'left-2';
    
    return 'hidden';
  };

  return (
    <div className="tech-capsule-container">
      <div className="carousel-wrapper">
        <button className="nav-btn" onClick={handlePrev} aria-label="Previous">
          <FiChevronLeft size={24} />
        </button>
        
        <div className="tech-capsule-track">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`tech-card ${getCardClass(index)}`}
              onClick={() => handleCardClick(index)}
            >
              <div className="tech-card-image-container">
                <img src={product.image} alt={product.title} className="tech-card-image" />
              </div>
              <div className="tech-card-content">
                <span className="tech-card-badge">{product.badge}</span>
                <h3 className="tech-card-title">{product.title}</h3>
                <p className="tech-card-desc">{product.desc}</p>
                
                <div className="tech-card-action">
                  <button className="tech-btn-add">
                    Use for free
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="nav-btn" onClick={handleNext} aria-label="Next">
          <FiChevronRight size={24} />
        </button>
      </div>

      <div className="pagination">
        {products.map((_, idx) => (
          <div 
            key={idx} 
            className={`dot ${idx === activeIndex ? 'active' : ''}`}
            onClick={() => handleCardClick(idx)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default TechCapsuleCarousel;

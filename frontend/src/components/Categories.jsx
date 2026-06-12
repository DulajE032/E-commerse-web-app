"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * Static category data — each entry has a display name and an image path
 * Images are stored in /public/categories/ and served at the root URL
 */
const CATEGORY_DATA = [
  { name: 'Phones',                     label: 'PHONES',                       image: '/categories/phones.png' },
  { name: 'iPads & MacBooks',           label: 'IPADS & MACBOOKS',             image: '/categories/laptops.png' },
  { name: 'Hubs & Docks',              label: 'HUBS & DOCKS',                 image: '/categories/hubs.png' },
  { name: 'Earbuds',                    label: 'EARBUDS',                      image: '/categories/earbuds.png' },
  { name: 'Powerbanks',                 label: 'POWERBANKS',                   image: '/categories/powerbanks.png' },
  { name: 'Charging Adapter & Cables',  label: 'CHARGING ADAPTER & CABLES',    image: '/categories/chargers.png' },
  { name: 'Headphones',                 label: 'HEADPHONES',                   image: '/categories/headphones.png' },
  { name: 'Speakers',                   label: 'SPEAKERS',                     image: '/categories/speakers.png' },
  { name: 'Wireless Mic',               label: 'WIRELESS MIC',                 image: '/categories/wireless-mic.png' },
  { name: 'Gimbals',                    label: 'GIMBALS',                      image: '/categories/gimbals.png' },
];

/* Framer Motion animation variants */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const Categories = () => {
  return (
    <section id="categories-section" className="max-w-7xl mx-auto px-4 md:px-8 mt-16 mb-16">
      {/* ───── Section Header ───── */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Categories
        </h2>
        <Link href="/products"
          className="text-sm font-semibold text-amber-700 hover:text-amber-900 hover:underline mt-2 inline-block transition-colors"
        >
          See more ›
        </Link>
      </div>

      {/* ───── Category Grid ───── */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {CATEGORY_DATA.map((cat, index) => (
          <motion.div key={index} variants={cardVariants}>
            <Link href={`/products?category=${encodeURIComponent(cat.name)}`}
              id={`category-card-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="
                block bg-[#e5e5e5] rounded-2xl p-5 
                flex flex-col items-center
                hover:shadow-xl hover:-translate-y-1.5 
                hover:bg-[#dcdcdc]
                transition-all duration-300 ease-out
                group cursor-pointer
                min-h-[200px]
              "
            >
              {/* Category Name */}
              <h3 className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-800 text-center mb-3 leading-snug min-h-[32px] flex items-center justify-center">
                {cat.label}
              </h3>

              {/* Category Image */}
              <div className="w-full flex-1 flex items-center justify-center p-2 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="
                    max-w-full max-h-[140px] object-contain
                    group-hover:scale-110
                    transition-transform duration-500 ease-out
                    mix-blend-multiply
                  "
                  loading="lazy"
                />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Categories;

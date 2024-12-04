'use client'
import React from 'react';

const MovingText: React.FC = () => {
  return (
    <div className="bg-gray-200 p-2 overflow-hidden">
      <div className="whitespace-nowrap animate-marquee">
        Good Read | tune: How UPS Truck Driver... | Wheels of Fortune: How UPS Truck Driver...
      </div>
    </div>
  );
};

export default MovingText;
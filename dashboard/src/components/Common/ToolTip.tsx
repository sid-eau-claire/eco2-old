'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export const ToolTip = ({ children, message, className, hintHPos, hintVPos }: { children: React.ReactNode, message: string, className?: string, hintHPos?: string, hintVPos?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}
      className="flex items-center justify-center relative" // Flexbox to center children
    >
      {children}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.2 }}
          className={twMerge("absolute bg-black text-white p-2 rounded-md text-sm min-w-[100px] max-w-xs", className)}
          style={{
            top: hintVPos || '100%', 
            left: hintHPos || '80%',
            transform: 'translate(-50%, -50%)',
            position: 'absolute', 
            zIndex: 10
          }}
        >
          {message}
        </motion.div>
      )}
    </div>
  );
};

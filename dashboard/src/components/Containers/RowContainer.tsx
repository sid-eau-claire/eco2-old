import React from 'react';
import { motion } from "framer-motion";
import { twMerge } from 'tailwind-merge';
type RowContainerProps = {
  className?: string;
  children?: React.ReactNode;
  index?: number | undefined;
}

const RowContainer: React.FC<RowContainerProps> = ({ children, className = '', index }) => {
  return (
    <>
    {index ? (
      <motion.div 
        key={index}
        className={twMerge(`rounded-sm border border-stroke bg-white dark:border-strokedark dark:bg-boxdark px-[1rem] pt-[1rem] pb-[1rem]`, className)}
        initial={{ opacity: 0.9, x: -100, y: (200 - index * 30) }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.1 + index * 0.01, duration: 0.8, type: 'spring', bounce: 0.45 }}
        >
      {children}
      </motion.div>
    ) : (
      <motion.div 
        className={twMerge(`rounded-sm border border-stroke bg-white dark:border-strokedark dark:bg-boxdark px-[1rem] pt-[1rem] pb-[1rem]`, className)}
        initial={{ opacity: 0.2, scaleX: 0.7  }}
        animate={{ opacity: 1, scaleX: 1   }}
        transition={{ delay: 0.1 , duration: 0.8, type: 'spring', bounce: 0.05 }}
        >
      {children}
      </motion.div>      
    )}
    </>
  );
};

export default RowContainer;

import React from 'react';
import { motion } from "framer-motion";
import { twMerge } from 'tailwind-merge';

type ColContainerProps = {
  className?: string;
  cols?: string;
  children?: React.ReactNode;
}

const ColContainer: React.FC<ColContainerProps> = ({ children, className = '', cols }) => {
  let newClassName = className;
  let gridClassNames = '';

  if (cols) {
    const colsArray = cols.split(':');
    if (colsArray.length == 4) {
      // Ensure classes are added in the correct order and logging the correct values for debug
      gridClassNames = `grid-cols-${colsArray[3]} md:grid-cols-${colsArray[2]} lg:grid-cols-${colsArray[1]} xl:grid-cols-${colsArray[0]}  `;
      // console.log("Grid classes set to:", gridClassNames);
    } else {
      console.error("Cols prop must be in the format 'xl:lg:md:sm' and have exactly four entries.");
    }
  }

  // Combine the classes using twMerge to handle any potential conflicts or duplicates
  const finalClassName = twMerge(
    "grid grid-cols-1 gap-x-4 gap-y-0  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 align-content-start mb-2",
    newClassName,
    gridClassNames
  );

  // console.log("Final className:", finalClassName);

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, type: 'spring', bounce: 0.45 }}
      className={finalClassName}
    >
      {children}
    </motion.div>
  );
};

export default ColContainer;

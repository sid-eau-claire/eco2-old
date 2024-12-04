// components/Popup.js
import React from 'react';
import { motion } from 'framer-motion';
import { RoundButton } from '../Button';
import { IoMdCloseCircle } from "react-icons/io";
import { twMerge } from 'tailwind-merge';

const PopupComponent = ({ isVisible, onClose, children, className = '', secondClassName = '' }) => {
  if (!isVisible) return null;

  return (
    <motion.div className={twMerge(`fixed inset-0 m-0 flex items-center justify-center bg-black bg-opacity-50 z-9999`, className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      >
      <motion.div className={twMerge(`min-w-[30rem] bg-white py-4 px-4 rounded-md relative h-full max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-lg`, secondClassName)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{delay: 0.2, duration: 0.3 }}
        // style={{ maxHeight: '90vh' }}
      >
        <div className='absolute top-[0.5rem] right-[0.5rem]'>
          <RoundButton
            icon={IoMdCloseCircle}
            onClick={onClose}
            className="bg-transparent text-primary "
            size="36"
            color="white"
            hint="Close"
            hintHPos='-10erm'
          />
        </div>
        <div className='overflow-y-auto h-fit mt-[1rem]'>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PopupComponent;

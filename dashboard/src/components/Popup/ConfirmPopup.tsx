import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoMdCheckmarkCircle, IoMdCloseCircle } from 'react-icons/io';
import LoadingButtonNP from '../Button/LoadingButtonNP';
import LoadingButton from '../Button/LoadingButton';
import { twMerge } from 'tailwind-merge';

interface ConfirmPopupProps {
  heading: string;
  message: string;
  button1Text?: string;
  button2Text?: string;
  button1Color?: string;
  button2Color?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmPopup: React.FC<ConfirmPopupProps> = ({ heading, message, onConfirm, onCancel, button1Text, button2Text, button1Color, button2Color }) => {
  const [showPopup, setShowPopup] = useState(true);

// In your ConfirmPopup component
  const [confirmActionComplete, setConfirmActionComplete] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setConfirmActionComplete(true); // Indicate action completion
  };

  const handleCancel = () => {
    onCancel();
    setConfirmActionComplete(true); // Indicate action completion
  };

  useEffect(() => {
    if (confirmActionComplete) {
      setShowPopup(false);
      setConfirmActionComplete(false); // Reset for next use
    }
  }, [confirmActionComplete]);

  return (
    <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-99"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div className="bg-white border border-gray-200 shadow-lg rounded-md p-4 max-w-md mx-auto w-full"
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">{heading}</h2>
        </div>
        <p className="text-gray-600 mt-2">
          {message}
        </p>
        <div className="flex justify-around mt-4 space-x-4">
          <LoadingButtonNP
            className={twMerge(`flex items-center justify-center bg-danger hover:scale-1.1  text-white px-4 py-2 rounded-md `, button1Color)}
            onClick={handleConfirm}
          >
            <IoMdCheckmarkCircle className='mr-2' size={24}/>
            {button1Text ? button1Text : 'Proceed'}
          </LoadingButtonNP>
          <LoadingButtonNP
            className={twMerge(`flex items-center justify-center bg-warning  hover:scale-1.1 text-white px-4 py-2 rounded-md `, button2Color)}
            onClick={handleCancel}
          >
            <IoMdCloseCircle className='mr-2' size={24}/>
            {button2Text ? button2Text : 'Cancel'}
          </LoadingButtonNP>
        </div>
      </motion.div>
    </motion.div>
  )
};

export default ConfirmPopup;
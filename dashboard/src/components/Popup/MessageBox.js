import React, { useState } from 'react';
import {motion} from 'framer-motion';

const MessageBox = ({heading,message,close}) => {
  const [showMessage, setShowMessage] = useState(true);

  const handleClose = () => {
    close(false)
  }
  return (
    <motion.div className="fixed top-[16rem] left-0 right-0 bg-white border border-gray-200 shadow-lg rounded-md p-4 max-w-md mx-auto w-full"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.2} }
    >
      <div className="flex flex-col justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">{heading}</h2>
      </div>
      <p className="text-gray-600 mt-2">
        {message}
      </p>
        <button
          className="bg-primary text-white px-4 py-2 rounded-md mt-4"
          onClick={handleClose }
        >
          Close
        </button>
    </motion.div>
  );
};

export default MessageBox;

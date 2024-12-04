// components/Popup.js
import React from 'react';
import { motion } from 'framer-motion';

const Popup = ({ url, isVisible, onClose }) => {
  if (!isVisible) return null;
  console.log(url)

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      margin: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div  style={{ position: 'relative' }}>
        <img src={url} alt="image" className='w-[60vw] ' />
        <motion.button onClick={onClose} style={{ position: 'absolute', bottom: 20, right: 10 }}
          className='bg-primary/80 hover:bg-primary text-white px-4 py-2 rounded-md'
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 300  }}
        >
          Return to Eau Claire One
        </motion.button>
      </div>
    </div>
  );
};

export default Popup;

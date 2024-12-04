import React, { useState, forwardRef } from 'react';
import { motion } from "framer-motion";
import { ImSpinner2 } from "react-icons/im";
import { twMerge } from 'tailwind-merge';
import { ToolTip } from '../Common/ToolTip';

type LoadingButtonProps = {
  className?: string;
  text: string;
  loadingText?: string;
  hint?: string;
};

const SubmitButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(({
  className = 'w-full rounded-lg bg-primary p-2 text-white hover:bg-opacity-90 flex justify-center items-center',
  text= 'Submit',
  loadingText = 'Processing ...',
  hint,
}, ref) => {
  const [isLoading, setIsLoading] = useState(false);

  // const handleClick = async () => {
  //   setIsLoading(true);
  //   try {
  //     await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
  //     await onClick();
  //   } catch (error) {
  //     console.error('Error occurred in LoadingButton:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  
  // Conditional ToolTip wrapping
  const button = (
    <motion.input
      type='submit'
      className={twMerge('w-full rounded-lg bg-primary p-2 text-white hover:bg-opacity-90 flex justify-center items-center', className)}
      disabled={isLoading}
      whileHover={{ scale: 1.04 }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      value={text}
    >
      {isLoading && (
        <div className='flex flex-row justify-between items-center'>
          <ImSpinner2 className="animate-spin mr-2" size={28} />
          <span className="ml-2">{loadingText}</span>
        </div>
      )}
    </motion.input>
  );

  return hint ? (
    <ToolTip message={hint}>{button}</ToolTip>
  ) : (
    button
  );
});

export default SubmitButton;

import React, { useState, forwardRef } from 'react';
import { motion } from "framer-motion";
import { ImSpinner2 } from "react-icons/im";
import { twMerge } from 'tailwind-merge';
import { ToolTip } from '../Common/ToolTip';
import Spinner from '@/components/Common/Spinner';

type LoadingButtonProps = {
  onClick?: () => void | null;  // Expecting a function that may or may not return a promise
  className?: string;
  loadingText?: string;
  children: React.ReactNode;
  disabled?: boolean;
  hint?: string;
  type?: 'button' | 'submit' | 'reset';
};

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(({
  onClick=() => {},
  className = 'w-full rounded-lg bg-primary p-2 text-white hover:bg-opacity-90 flex justify-center items-center',
  loadingText = 'Processing ...',
  children,
  disabled,
  hint,
  type
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
  const handleClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (type !== 'submit') {
      event.preventDefault(); // Prevent form submission if not a submit button
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
        if (onClick) {
          await onClick();
        }
      } catch (error) {
        console.error('Error occurred in LoadingButton:', error);
      } finally {
        setIsLoading(false);
      }
    }
    // If type is 'submit', let the default form submission handle it
  };
  
  // Conditional ToolTip wrapping
  const button = (
    <motion.button
      ref={ref}
      type={type}
      onClick={handleClick}
      className={twMerge('w-full rounded-lg bg-primary p-2 text-white hover:bg-opacity-90 flex justify-center items-center disabled:bg-warmGray-400', className)}
      disabled={isLoading || disabled}
      whileHover={{ scale: 1.04 }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {isLoading ? ( 
      <>
        <div className='flex flex-row justify-between items-center'>
          <ImSpinner2 className="animate-spin mr-2" size={24} />
          <span className="ml-2">{loadingText}</span>
        </div>
      </>
      ) : (
        children
      )}
    </motion.button>
  );

  return hint ? (
    <ToolTip message={hint}>{button}</ToolTip>
    ) : (
    button
  );
});

export default LoadingButton;

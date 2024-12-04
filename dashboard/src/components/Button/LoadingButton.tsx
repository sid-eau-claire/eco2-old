import React, { useState, forwardRef } from 'react';
import { motion } from "framer-motion";
import { ImSpinner2 } from "react-icons/im";
import { twMerge } from 'tailwind-merge';
import { ToolTip } from '../Common/ToolTip';

type LoadingButtonProps = {
  onClick?: () => Promise<void> | null;  // Function expected to return a promise or null
  className?: string;
  loadingText?: string;
  children: React.ReactNode;
  disabled?: boolean;
  hint?: string;
  type?: 'button' | 'submit' | 'reset';
};

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(({
  onClick=() => Promise.resolve(),
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
  //     await new Promise(resolve => setTimeout(resolve, 300));  // Simulating a delay
  //     await onClick();  // Await the onClick promise
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
  

  // Creating the button component separately for clarity and reusability
  const buttonComponent = (
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
        <div className='flex flex-row justify-between items-center'>
          <ImSpinner2 className="animate-spin mr-2" size={28} />
          <span className="ml-2">{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );

  // Conditional rendering using the 'hint' prop
  return hint ? (
    <ToolTip message={hint}>
      {buttonComponent}
    </ToolTip>
  ) : (
    buttonComponent
  );
});

export default LoadingButton;

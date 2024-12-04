'use client'
import React, {useState} from 'react';
import { ColContainer, RowContainer } from '@/components/Containers';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';
import { LoadingButtonNP} from '@/components/Button';

type StepProps = {
  stepNumber: number;
  children: React.ReactNode;
  name: string;
};

export const Step: React.FC<StepProps> = ({ children }) => {
  return <>{children}</>;
}



type StepContainerProps = {
  children: React.ReactElement<StepProps>[];
  currentStep: number; // Add the 'currentStep' property to the type definition
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>; // Add the 'setCurrentStep' property to the type definition
  className?: string;
  stepCompletion: boolean[];
};

export const StepContainer: React.FC<StepContainerProps> = ({children, currentStep, setCurrentStep, className, stepCompletion }) => {

  const handleNext = () => {
    if (currentStep < children.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <RowContainer className={twMerge(`flex flex-col items-center mb-4 space-x-4 min-h-[calc(100vh-8rem)]`, className)}>
      <nav aria-label='Progress'>
        <ol role='list' className='space-y-4 md:flex justify-center items-center md:space-x-8 md:space-y-0'>
          {children.map((child, index) => (
            <li key={index} className={`md:flex-3 ${currentStep === index ? 'border-primary' : 'border-primary/20 '} py-2 pl-4 md:border-t-4 transition-colors`}>
              <span className={`text-md font-medium ${currentStep === index ? 'text-sky-600' : 'text-gray-500'}`}>
                {child.props.name}
              </span>
            </li>
          ))}
        </ol>
      </nav>
      <div className='mt-4 flex flex-row justify-between space-x-4 items-center'>
        {currentStep >= 1 ? (
          <motion.button type='button' className="flex flex-row justify-center items-center m-4 bg-transparent text-meta-4 px-4 py-3 rounded-md w-[6rem] h-[2rem]"
            initial={{ x: 0 }}
            animate={{ x: [0, -10, 0, -5, 0, -2, 0] }}  // Array of positions for keyframes
            whileHover={{ scale: 1.05 }}
            transition={{ 
              delay: 0.1, 
              duration: 1.5, 
              times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1], // Timing for each keyframe
              ease: "easeInOut" // Easing function to smooth the animation
            }}
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            <FaChevronLeft size={30}/>
          </motion.button>

        ):(<div className='w-[6rem]'></div>)}
        {React.cloneElement(children[currentStep], { stepNumber: currentStep + 1 })}
        {stepCompletion[currentStep] ? currentStep <= children.length - 2 && (
          <motion.button type="button" className="flex flex-row justify-center items-center m-4 bg-transparent text-meta-4 px-4 py-3 rounded-md w-[6rem] h-[2rem]"
            initial={{ x: 0 }}
            animate={{ x: [0, 10, 0, 5, 0, 2, 0] }}  // Keyframes moving right with decreasing magnitude
            whileHover={{ scale: 1.05 }}
            transition={{ 
              delay: 0.1, 
              duration: 1.5, 
              times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1], // Timing for each keyframe
              ease: "easeInOut" // Easing function for smooth transition
            }}
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            <FaChevronRight size={30}/> 
          </motion.button>
        ):(<div className='w-[6rem]'></div>)}
      </div>
    </RowContainer>
  );
};

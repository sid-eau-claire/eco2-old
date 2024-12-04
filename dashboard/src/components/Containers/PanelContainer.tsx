'use client'
import React, { useState, useEffect, cloneElement, Children } from 'react';
import { twMerge } from 'tailwind-merge';
import { BiCollapseVertical, BiExpandVertical } from 'react-icons/bi';
import { ToolTip } from '@/components/Common/ToolTip';
import {motion} from 'framer-motion';

type PanelContainerProps = {
  header?: string;
  defaultActive?: boolean;
  collapse?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const PanelContainer: React.FC<PanelContainerProps> = ({
  header = '',
  defaultActive = false,
  collapse =false,
  children=<></>,
  className=''
}) => {
  const [active, setActive] = useState(defaultActive);

  useEffect(() => {
    setActive(!collapse);
  }, [collapse]);

  const handleToggle = () => {
    setActive(!active);
  };


  return (
    <motion.div className={twMerge("rounded-md border h-fit bg-white border-stroke p-4 shadow-9 dark:border-form-strokedark dark:shadow-none sm:p-4 mt-8 relative", className)}
    // <motion.div className={twMerge("rounded-md border h-fit bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-whiten to-white   border-stroke p-4 shadow-9 dark:border-form-strokedark dark:shadow-none sm:p-4 mt-8 relative", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.5}}
    >
      <span className={`relative flex w-full items-center justify-between gap-1.5 sm:gap-3 xl:gap-6 mb-4 ${active ? 'active' : ''}`} onClick={handleToggle}>
        <div className='absolute -top-[0.5rem] -left-[0.4rem]'>
          <h4 className="text-left text-title-sm font-medium text-black bg-transparent dark:bg-form-input dark:text-white px-1 cursor-pointer">
            {header}
          </h4>
        </div>
        <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-md bg-[#F3F5FC] dark:bg-meta-4">
          {active ? 
            <ToolTip  message='Collapse' hintHPos="-5rem"><BiCollapseVertical className="fill-primary cursor-pointer stroke-primary dark:fill-white dark:stroke-white" /></ToolTip>
          : 
            <ToolTip  message='Expand'  hintHPos="-5rem"><BiExpandVertical className="fill-primary cursor-pointer stroke-primary dark:fill-white dark:stroke-white" /></ToolTip>
          }
          {/* {active ? 
            <BiCollapseVertical className="fill-primary cursor-pointer stroke-primary dark:fill-white dark:stroke-white" />
          : 
            <BiExpandVertical className="fill-primary cursor-pointer stroke-primary dark:fill-white dark:stroke-white" />
          }           */}
        </div>
      </span>
      <div className={`mt-[2rem] duration-200 ease-in-out ${active ? 'block' : 'hidden'}`}>
        {children}
        {/* {enhancedChildren} */}
      </div>
    </motion.div>
  );
};

export default PanelContainer;

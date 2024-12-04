'use client'
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { ToolTip } from '../Common/ToolTip';
import {motion} from 'framer-motion';
import { UseFormRegister, FieldValues } from 'react-hook-form';
import { on } from 'events';

type SwitchProps = {
  label: string;
  name: string;
  // register: ((name: string) => { [key: string]: any }) | null;
  register?: any,
  // type: string;
  defaultChecked?: boolean;
  onChange?: any
  isChecked?: boolean;
  isEditable?: boolean;
  className?: string;
  hint?: string | undefined;
}

const Switch: React.FC<SwitchProps> = ({
  label,
  name,
  register = false,
  // type,
  defaultChecked,
  onChange = () => {},
  isChecked,
  isEditable = true,
  className= '',
  hint = 'undefined'
}) => {
  let baseInput = null
  const toggleClass = isChecked ? 'right-1 translate-x-full bg-primary dark:bg-white' : '';
  const sliderClasses = twMerge('absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition', toggleClass, !isEditable ? 'bg-form-strokedark/30' : '');

  if (register == false ) {
    baseInput = (
      <input
        type="checkbox"
        // {...register(name)}
        className="sr-only"
        name={name}
        // value={type}
        checked={isChecked}
        onChange={onChange}
        defaultChecked={defaultChecked}
        disabled={!isEditable}
      />
    )    
  } else {
      baseInput = (
        <input
          type="checkbox"
          {...register(name)}
          className="sr-only"
          name={name}
          // value={type}
          // checked={isChecked}
          // onChange={(e) => onChange(e, type)}
          defaultChecked={defaultChecked}
          disabled={!isEditable}
        />
      )

  }
  return (
    <motion.div className="mb-3.5"
      initial={{ opacity: 0.2, scaleX: 0.7  }}
      animate={{ opacity: 1, scaleX: 1   }}
      transition={{ delay: 0.1 , duration: 0.8, type: 'spring', bounce: 0.05 }}
    >
      <label className="flex cursor-pointer select-none items-center">
        <div className="relative mr-2 z-0">
          {hint ? (
            <ToolTip message={hint} >
              {baseInput}
            </ToolTip>
          ):(
            <>
              {baseInput}
            </>
          )}
          <div className={twMerge(`block h-8 w-14 rounded-full bg-meta-9 dark:bg-[#5A616B]` )}></div>
          <div className={sliderClasses}></div>
        </div>
        {label}
      </label>
    </motion.div>
  );
};

export default Switch;

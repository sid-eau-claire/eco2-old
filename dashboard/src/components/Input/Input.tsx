'use client'
import React, { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';
import { ToolTip } from '../Common/ToolTip';
import { UseFormSetValue } from 'react-hook-form';
import { watch } from 'fs';

type InputProps = {
  label: string;
  name: string;
  form?: { setValue: UseFormSetValue<any>, getValues: any, watch: any };
  register?: any;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: any;
  placeholder?: string;
  isEditable?: boolean;
  required?: boolean;
  errors?: { [key: string]: any };
  type?: string;
  className?: string;
  hint?: string;
  minLength?: number;
  maxLength?: number;
  disabled?: boolean;
  step?: number;
  focus?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  form,
  register = () => {},
  defaultValue = '',
  onChange,
  onKeyDown,
  placeholder,
  isEditable = true,
  required = false,
  errors,
  type = "text",
  className = '',
  hint,
  minLength,
  maxLength,
  disabled,
  step,
  focus,
}) => {

  const watchValue = form?.watch(name) ;

  // const formatCurrency = (value: string) => {
  //   const numericValue = parseInt(value.replace(/,/g, ''), 10);
  //   return isNaN(numericValue) ? '' : numericValue.toLocaleString();
  // };
  const formatCurrency = (value: string) => {
    const numericValue = parseInt(value?.replace(/,/g, ''), 10);
    // Return null instead of an empty string if the value is not a number
    return isNaN(numericValue) ? null :  numericValue.toLocaleString();
  };  

  const formatPhoneNumber = (value: string) => {
    // console.log('here')
    if (!value || value === '+1 (' || value === '+1') return value;
    if (value.length === 1) {
      value = '+1 (' + value;
    } else {
      value = '+1 (' + value.replace(/[^\d]/g, '').slice(1);
    }
    const phoneNumberDigits = value.replace(/[^\d]/g, '').slice(1);
    if (phoneNumberDigits.length < 4) return value;
    if (phoneNumberDigits.length < 7) return `+1 (${phoneNumberDigits.slice(0, 3)}) ${phoneNumberDigits.slice(3)}`;
    return `+1 (${phoneNumberDigits.slice(0, 3)}) ${phoneNumberDigits.slice(3, 6)}-${phoneNumberDigits.slice(6, 10)}`;
  };

  useEffect(() => {
    if (type === 'tel' && form) {
      const formattedNumber = formatPhoneNumber(form.getValues(name)?.toString());
      // console.log(formattedNumber)
      form.setValue(name, formattedNumber);
    }
    if (type === 'currency' && form) {
      const formattedNumber = formatCurrency(form.getValues(name)?.toString());
      // console.log(formattedNumber)
      // form.setValue(name, formattedNumber);
      form.setValue(name, formattedNumber ?? null);
    }
  }, [watchValue]);

  const baseInput = (
    <div className={twMerge("mb-3.5")}>
      <motion.label className="mb-1 block text-black dark:text-white"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.95 }}
        tabIndex={-1}
      >
        {label}{required && <strong className='text-rose-600'>*</strong>}
      </motion.label>
      <input
        {...register(name)}
        name={name}
        type={type}
        step={step}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        readOnly={!isEditable}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        disabled={disabled}
        focus={focus}
        className={twMerge('w-full rounded border-[1.5px] border-stroke bg-transparent py-1 px-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary focus:bg-whiten transition ease-in-out duration-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50', className)}
      />
      {errors && errors[name] && <p className="text-danger text-sm text-right">{errors[name].message}</p>}
    </div>    
  );
  return (
    <>
      {hint ? (
        <ToolTip message={hint}>
          {baseInput}
        </ToolTip>
      ) : (
        baseInput
      )}
    </>
  );
};

export default Input;

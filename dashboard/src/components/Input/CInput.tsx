'use client';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';
import { ToolTip } from '../Common/ToolTip';
import { UseFormSetValue } from 'react-hook-form';

type InputProps = {
  label: string;
  name: string;
  form: {
    setValue: UseFormSetValue<any>, 
    getValues: any, 
    watch: any,
    register: any,
  };
  register?: any;
  defaultValue?: string | number;
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
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  form,
  register,
  defaultValue = '',
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
  step
}) => {
  const [displayValue, setDisplayValue] = useState(defaultValue.toString());
  const [opacityValue, setOpacityValue] = useState('opacity-0');
  const formatCurrency = (value: string) => {
    const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(numericValue) ? '' : numericValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  useEffect(() => {
    if (type === 'currency') {
      setDisplayValue(formatCurrency(form.getValues(name)?.toString() || ''));
    }
  }, [form.watch(name)]);

  const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/[^\d.-]/g, '');
    setDisplayValue(formatCurrency(cleanValue));
    form.setValue(name, parseFloat(cleanValue) || 0);
  };

  const handleFocus = () => {
    setDisplayValue(form.getValues(name).toString());
  };

  const handleBlur = () => {
    setDisplayValue(formatCurrency(form.getValues(name)?.toString() || ''));
  };

  const inputContent = (
    <>
      {type === 'currency' && (
        <div className='relative'>
          <input
            type="text"
            name={`${name}-display`}
            value={displayValue}
            onChange={handleDisplayChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            readOnly={!isEditable}
            className={twMerge('w-full rounded border-[1.5px] border-stroke bg-transparent py-1 px-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary focus:bg-whiten transition ease-in-out duration-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50', className)}
            required={required}
            minLength={minLength}
            maxLength={maxLength}
            disabled={disabled || !isEditable}
            step={step}
          />
          <input
            name={name}
            {...register(name)}
            type="number"
            className={twMerge('absolute inset-0 w-full rounded border-[1.5px] border-stroke bg-transparent py-1 px-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary focus:bg-whiten transition ease-in-out duration-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50', className, opacityValue)}
            onBlur={()=> setOpacityValue('opacity-0')}
            onFocus={()=> setOpacityValue('opacity-100')}
            disabled={disabled || !isEditable}
            step={step}
          />
        </div>
      )}
      {type !== 'currency' && (
        <input
          {...form.register(name)}
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          readOnly={!isEditable}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          disabled={disabled || !isEditable}
          step={step}
          className={twMerge('w-full rounded border-[1.5px] border-stroke bg-transparent py-1 px-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary focus:bg-whiten transition ease-in-out duration-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50', className)}
        />
      )}
    </>
  );

  return (
    <div className={twMerge("mb-3.5")}>
      <motion.label className="mb-1 block text-black dark:text-white"
        // whileHover={{ scale: 1.01 }}
        // whileTap={{ scale: 0.95 }}
      >
        {label}{required && <strong className='text-rose-600'>*</strong>}
      </motion.label>
      {hint ? (
        <ToolTip message={hint}>
          {inputContent}
        </ToolTip>
      ) : (
        inputContent
      )}
      {errors && errors[name] && <p className="text-danger text-sm text-right">{errors[name].message}</p>}
    </div>
  );
};

export default Input;

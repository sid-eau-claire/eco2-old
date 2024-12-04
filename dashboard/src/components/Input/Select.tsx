'use client'
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { ToolTip } from '../Common/ToolTip';
import { UseFormRegister, FieldValues } from 'react-hook-form';

type SelectInputProps = {
  label: string;
  name: string;
  defaultOption?: string
  defaultValue?: string;
  options: { id: string | number; name: string }[];
  register?: any;
  value?: string | number | null | undefined;
  // register?:  UseFormRegister<FieldValues>;
  // value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  isEditable?: boolean;
  required?: boolean;
  errors?: { [key: string]: any };
  className?: string;
  hint?: string | undefined;
}

const Select: React.FC<SelectInputProps> = ({
  label,
  name,
  defaultOption,
  defaultValue,
  options,
  register = () => {},
  value,
  onChange,
  isEditable = true,
  required = false,
  errors = {},
  className = '',
  hint = ''
}) => {
  // const registerProps = register ? register(name) : {};
  const baseSelect = (
    <select
      {...register(name)}
      name={name}
      // value={value}
      // onChange={onChange}
      disabled={!isEditable}
      required={required}
      defaultValue={defaultValue}
      value={value}
      className={twMerge('w-full rounded border-[1.5px] border-stroke bg-transparent py-1.5 px-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary focus:bg-whiten transition ease-in-out duration-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50', className)}
    >
      {defaultOption && <option value="">{defaultOption}</option>}
      {options.map((option) => (
        <option key={option.id} value={option.id}>{option.name}</option>
      ))}
    </select>    
  )

  return (
    <div className={twMerge(`mb-3.5`, className)}>
      <label className="mb-1 block text-black dark:text-white">
        {label}<strong className='text-rose-600'>{required && "*"}</strong>
      </label>
      { hint ? (
        <ToolTip message={hint}>
          {baseSelect}
        </ToolTip>
      ) : (
        <>
        {baseSelect}
        </>
      )}
      {errors && errors[name] && <p className="text-danger text-sm text-right">{errors[name]?.message}</p>}
    </div>
  );
};

export default Select;

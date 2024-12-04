import React from 'react';
import { motion } from "framer-motion";
import { twMerge } from 'tailwind-merge'

type FileInputProps = {
  label: string;
  name: string;
  register?: (name: string) => { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; name: string; ref: React.Ref<any>; };
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditable?: boolean;
  required?: boolean;
  accept?: string;
  errors?: { [key: string]: any };
  className?: string;
  id?: string;
  ref?: any;
  multiple?: boolean;
}


export const FileInput: React.FC<FileInputProps> = ({
  label,
  name,
  register = () => ({}),
  onChange = () => {},
  isEditable = true,
  required = false,
  accept = '',
  errors = {},
  className = '',
  id,
  ref,
  multiple = true,
}) => {
  const registerProps = register ? register(name) : {};

  return (
    <div className="mb-3.5" >
      <motion.label className="mb-1 block text-black dark:text-white"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {label}{label && <strong className='text-rose-600'>{required && "*"}</strong>}
      </motion.label>
      <input
        {...registerProps}
        name={name}
        id={id}
        ref={ref}
        type="file"
        onChange={onChange}
        disabled={!isEditable}
        required={required}
        accept={accept}
        multiple={multiple}
        className={twMerge('w-full cursor-pointer rounded border-[1.5px] border-stroke bg-transparent py-1 px-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary focus:bg-whiten', 
          className)}
      />
      {errors && errors[name] && <p className="text-danger text-sm text-right">{errors[name].message}</p>}
    </div>
  );
};

export default FileInput
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { twMerge } from 'tailwind-merge'

type FileInputProps = {
  label: string;
  name: string;
  setValue: (name: string, value: any, shouldValidate?: boolean) => void; // Added for manual handling
  isEditable?: boolean;
  required?: boolean;
  accept?: string;
  errors?: { [key: string]: any };
  className?: string;
  id?: string;
  multiple?: boolean;
  defaultValue?: any;
}

export const FilesInput: React.FC<FileInputProps> = ({
  label,
  name,
  setValue,
  isEditable = true,
  required = false,
  accept = '',
  errors = {},
  className = '',
  id,
  multiple = true,
  defaultValue
}) => {
  // State to store the list of file names
  const [fileNames, setFileNames] = useState<string[]>([]);

  // Handle file changes
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setValue(name, files);  // Manually update form state with file list
    // Update local state with file names
    setFileNames(files.map(file => file.name));
  };

  return (
    <div className="mb-3.5">
      <motion.label className="mb-1 block text-black dark:text-white"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {label}{required && <strong className='text-rose-600'>*</strong>}
      </motion.label>
      <input
        type="file"
        name={name}
        id={id}
        onChange={handleFileChange}
        disabled={!isEditable}
        required={required}
        accept={accept}
        multiple={multiple}
        defaultValue={defaultValue}
        className={twMerge('w-full cursor-pointer rounded border-[1.5px] border-stroke bg-transparent py-1 px-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary focus:bg-whiten',
          className)}
      />
      {errors && errors[name] && <p className="text-danger text-sm text-right">{errors[name].message}</p>}
      {/* Display the list of file names */}
      {fileNames.length > 0 && (
        <div className="mt-2">
          <strong>Selected Files:</strong>
          <ul className="list-disc pl-5">
            {fileNames.map((fileName, index) => (
              <li key={index}>{fileName}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilesInput;

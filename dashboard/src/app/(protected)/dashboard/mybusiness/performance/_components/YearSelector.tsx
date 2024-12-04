'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfYear, endOfYear } from 'date-fns';

type DateRangePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: Date, endDate: Date) => void;
  inputStartDate: Date;
  inputEndDate: Date;
  year: number;
  setYear: React.Dispatch<React.SetStateAction<number>>;
};

const YearSelector: React.FC<DateRangePopupProps> = ({ isOpen, onClose, onApply, inputStartDate, inputEndDate, year, setYear }) => {
  const currentYear = new Date().getFullYear();  // Define `currentYear` inside the component
  const [startDate, setStartDate] = useState(inputStartDate);
  const [endDate, setEndDate] = useState(inputEndDate);

  useEffect(() => {
    setStartDate(startOfYear(new Date(year, 0, 1)));
    setEndDate(endOfYear(new Date(year, 0, 1)));
  }, [year]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(startDate, endDate);
    onClose();
  };

  return (
    <motion.div className="fixed inset-0 bg-black/50 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-999"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-white p-4 rounded-lg shadow-lg space-y-4 dark:bg-black-2 dark:text-white">
        <h3 className="text-lg font-semibold mb-8">Please select Year:</h3>
        <div className='flex flex-row justify-center gap-4 items-center'>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="p-2 border rounded">
            {[...Array(5)].map((_, idx) => (
              <option key={idx} value={currentYear - idx}>{currentYear - idx}</option>
            ))}
          </select>
        </div>
        {startDate && endDate && (
          <div className="mt-4 text-center">
            Selected Dates: {format(startDate, 'MMM dd, yyyy')} to {format(endDate, 'MMM dd, yyyy')}
          </div>
        )}
        <div className="flex justify-end items-center gap-4 mt-4">
          <button
            onClick={handleApply}
            className="text-md px-4 py-2 w-[8rem] bg-success text-white rounded-md hover:bg-green-600 duration-300"
          >
            Apply
          </button>
          <button onClick={onClose} className="text-md px-4 py-2 w-[8rem] bg-danger text-white rounded-md hover:bg-red-600 duration-300">
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default YearSelector;

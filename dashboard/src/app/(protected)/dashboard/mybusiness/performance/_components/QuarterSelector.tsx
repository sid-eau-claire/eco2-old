'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfQuarter, endOfQuarter } from 'date-fns';

type DateRangePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: Date, endDate: Date) => void;
  inputStartDate: Date;
  inputEndDate: Date;
  year: number;
  quarter: string;
  setYear: React.Dispatch<React.SetStateAction<number>>;
  // setQuarter: React.Dispatch<React.SetStateAction<string>>;
  setQuarter: any;
};

const QuarterSelector: React.FC<DateRangePopupProps> = ({ isOpen, onClose, onApply, inputStartDate, inputEndDate, year, quarter, setYear, setQuarter }) => {
  const currentYear = new Date().getFullYear();  // Corrected: Define `currentYear` inside the component
  const [startDate, setStartDate] = useState(inputStartDate);
  const [endDate, setEndDate] = useState(inputEndDate);

  useEffect(() => {
    const quarterNum = parseInt(quarter.substring(1));
    setStartDate(startOfQuarter(new Date(year, (quarterNum - 1) * 3, 1)));
    setEndDate(endOfQuarter(new Date(year, (quarterNum - 1) * 3, 1)));
  }, [year, quarter]);

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
        <h3 className="text-lg font-semibold mb-8">Please select Year and Quarter:</h3>
        <div className='flex flex-row justify-center gap-4 items-center'>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="p-2 border rounded w-[5rem]">
            {[...Array(5)].map((_, idx) => (
              <option key={idx} value={currentYear - idx}>{currentYear - idx}</option>
            ))}
          </select>
          <select value={quarter} onChange={e => setQuarter(e.target.value)} className="p-2 border rounded w-[5rem]">
            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
              <option key={q} value={q}>{q}</option>
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

export default QuarterSelector;

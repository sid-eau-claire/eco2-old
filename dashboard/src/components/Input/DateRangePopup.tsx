'use client'
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns';

type DateRangePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: Date | null, endDate: Date | null) => void;
  inputStartDate: Date | null;
  inputEndDate: Date | null;
};

const DateRangePopup: React.FC<DateRangePopupProps> = ({ isOpen, onClose, onApply, inputStartDate, inputEndDate }) => {
  const [startDate, setStartDate] = useState<Date | null>(inputStartDate);
  const [endDate, setEndDate] = useState<Date | null>(inputEndDate);
  const [isCustomRange, setIsCustomRange] = useState(false);

  if (!isOpen) return null;

  const applyPreset = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
    setIsCustomRange(false); // Ensure the custom range selector is not shown for presets
  };

  const formatDate = (date: Date | null) => {
    return date ? format(date, 'MMM dd, yyyy') : 'Not selected';
  };

  const quickSelections = [
    { label: 'This Week', dates: () => applyPreset(startOfWeek(new Date()), endOfWeek(new Date())) },
    { label: 'Last Week', dates: () => applyPreset(startOfWeek(subWeeks(new Date(), 1)), endOfWeek(subWeeks(new Date(), 1))) },
    { label: 'This Month', dates: () => applyPreset(startOfMonth(new Date()), endOfMonth(new Date())) },
    { label: 'Last Month', dates: () => applyPreset(startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1))) },
  ];

  return (
    <motion.div className="fixed inset-0 bg-black/50 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-white p-4 rounded-lg shadow-lg space-y-4 dark:bg-black-2 dark:text-white">
        <h2 className="text-lg font-semibold">Quick Selections</h2>
        <div className='flex flex-row justify-center gap-4 items-center'>
          {quickSelections.map(({ label, dates }) => (
            <button key={label} onClick={dates} disabled={isCustomRange} className={`px-4 py-2 w-[9rem] bg-primary text-white rounded-md ${isCustomRange ? 'bg-gray-400' : 'hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none active:bg-blue-800'} transition duration-300 ease-in-out shadow-lg disabled:bg-body`}>
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4 text-center">
          Selected Dates: 
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className='mx-2 font-semibold'
            >
              {formatDate(startDate)}
            </motion.span> 
            to 
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className='mx-2 font-semibold'
            >
              {formatDate(endDate)}
            </motion.span>
        </div>
        {isCustomRange && (
          <>
            <h2 className="mt-4 text-lg font-semibold">Custom Date Range</h2>
            <div className="flex gap-4 justify-center">
              <DatePicker
                selected={startDate}
                onChange={(date: Date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
                className="p-2 border rounded w-[12rem]"
              />
              <DatePicker
                selected={endDate}
                onChange={(date: Date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="End Date"
                className="p-2 border rounded w-[12rem]"
              />
            </div>
          </>
        )}
        <button onClick={() => setIsCustomRange(true)} className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-gray-400 transition duration-300 ease-in-out shadow">
          +Custom Range
        </button>
        <div className="flex justify-end items-center gap-4 mt-4">
          <button
            onClick={() => {
              onApply(startDate, endDate);
              onClose();
            }}
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

export default DateRangePopup;

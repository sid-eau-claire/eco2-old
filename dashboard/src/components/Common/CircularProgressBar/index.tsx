import { motion } from 'framer-motion';
import React from 'react';

interface CircularProgressBarProps {
  progress: number;
  total: number;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({ progress, total }) => {
  const circumference = 2 * Math.PI * 50; // Assuming the radius of the circle is 50
  const progressPercentage = progress / total;
  const strokeDashoffset = circumference - progressPercentage * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="#e6e6e6"
          strokeWidth="20"
        />
        <motion.circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="blue"
          strokeWidth="20"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 0.5,
            ease: "linear",
          }}
        />
      </svg>
      <div className="text-sm font-semibold mt-2">
        {progress} / {total}
      </div>
    </div>
  );
};

export default CircularProgressBar;

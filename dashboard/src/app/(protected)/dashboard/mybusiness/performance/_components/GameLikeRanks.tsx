'use client'
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Celebration } from '@/components/Common';

const Arrow = ({ isFirst, isLast, color, progress, isCurrent }: { isFirst: boolean, isLast: boolean, color: string, progress: number, isCurrent: boolean }) => {
  let path;
  if (isFirst) {
    path = "M0 0 H152 L170 27 L152 54 H0 Z";
  } else if (isLast) {
    path = "M0 0 L18 27 L0 54 H170 V0 Z";
  } else {
    path = "M0 0 L18 27 L0 54 H152 L170 27 L152 0 Z";
  }

  return (
    <svg width="170" height="54" viewBox="0 0 170 54" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id={`clip-${isFirst ? 'first' : isLast ? 'last' : 'middle'}`}>
          <path d={path} />
        </clipPath>
      </defs>
      <path d={path} fill={color} />
      <rect x="0" y="0" width={`${progress}%`} height="54" fill="#4ADE80" 
            clipPath={`url(#clip-${isFirst ? 'first' : isLast ? 'last' : 'middle'})`} />
      {isCurrent && (
        <motion.path
          d={path}
          fill="none"
          stroke="#4ADE80"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress / 100 }}
          transition={{delay: 3, duration: 4, ease: "easeInOut" }}
        />
      )}
      {isCurrent && (
        <motion.text
          x="25"
          y="18"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="bold"
          animate={{ opacity: [0.1, 1, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {Math.round(progress)}%
        </motion.text>
      )}
    </svg>
  );
};

// const Celebration = () => {
//   const [show, setShow] = useState(true);
//   const { width, height } = useWindowSize();

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setShow(false);
//     }, 3000);
//     return () => clearTimeout(timer);
//   }, []);

//   if (!show) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//       <Confetti width={width} height={height} />
//       <div className="text-white text-6xl font-bold animate-fade-in">Celebration</div>
//     </div>
//   );
// };

const GameLikeRanks = ({ ranks, currentRank, overallProgress, progressColor }: { ranks: any, currentRank: any, overallProgress: number, progressColor: string }) => {
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (overallProgress === 100) {
      setShowCelebration(true);
    }
  }, [overallProgress]);

  return (
    <>
      <div className="flex flex-wrap justify-center" style={{ gap: '-1px' }}>
        {ranks.map((rank: any, index: number) => {
          const isFirst = index === 0;
          const isLast = index === ranks.length - 1;
          const isCurrent = rank.name === currentRank.name;
          const isCompleted = rank.rankValue < currentRank.rankValue;
          const arrowProgress = isCompleted ? 100 : (isCurrent ? overallProgress : 0);
          const getArrowColor = () => {
            if (isCompleted) return '#4ADE80'; // green-400
            if (isCurrent) return '#FDE047'; // yellow-300
            return '#D1D5DB'; // gray-300
          };

          // Split rank name for wrapping
          const [firstLine, ...restLines] = rank.name.split(' ');

          return (
            <motion.div key={rank.id} className="relative"
              initial={{ x: -index * 170, scale: 0, rotate: 20, opacity: 0 }}
              animate={{ x: 0, scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 2, delay: 1 + 0.1 * index, ease: "easeOut" }}
            >
              <div className="relative" style={{ width: '20%', minWidth: '170px' }}>
                <Arrow 
                  isFirst={isFirst} 
                  isLast={isLast} 
                  color={getArrowColor()}
                  progress={arrowProgress}
                  isCurrent={isCurrent}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
                  <span className="text-center text-sm leading-tight break-words text-black font-semibold">
                    {firstLine}
                  </span>
                  {restLines.length > 0 && (
                    <span className="text-center text-sm leading-tight break-words text-black font-semibold">
                      {restLines.join(' ')}
                    </span>
                  )}
                </div>
              </div>
              {isCurrent && (
                <motion.div
                  className="absolute -bottom-4 transform -translate-x-1/2"
                  style={{ left: `${overallProgress}%` }}
                  animate={{ y: [0, -10, 0], scaleX: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className={twMerge(`w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[16px]`, `border-b-green-600`)}></div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
      {showCelebration && <Celebration />}
    </>
  );
};

export default GameLikeRanks;
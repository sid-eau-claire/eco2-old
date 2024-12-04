import React from 'react';

const PartnerBadge = ({ tier, text, isLast }: { tier: string, text: string, isLast?: boolean }) => {
  return (
    <div className={`relative px-4 py-2 bg-${tier}-500 text-white font-bold text-center rounded`}>
      {text}
      {!isLast && (
        <>
          <div className="absolute top-1/2 left-[-10px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-${tier}-500"></div>
          <div className="absolute top-1/2 right-[-10px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-${tier}-500"></div>
        </>
      )}
      {isLast && (
        <div className="absolute top-1/2 left-[-10px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-yellow-500"></div>
      )}
    </div>
  );
};

export default PartnerBadge;

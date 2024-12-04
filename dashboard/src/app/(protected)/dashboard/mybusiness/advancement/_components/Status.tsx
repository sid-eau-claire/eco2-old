import React from 'react';

const PartnerBadge = ({ tier, text }: { tier: string, text: string }) => {
  return (
    <div className={`relative bg-${tier}-500 text-pretty text-center w-[10rem] h-[4rem] text-white px-4 py-2`}>
      {text}
      {/* <div className="absolute top-1/2 left-[-30px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-green-300"></div>
      <div className="absolute top-1/2 right-[-30px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-green-300"></div> */}

    </div>
  );
};

const ProgressBar = ({ percentage, color }: { percentage: number, color: string }) => {
  return (
    <div className="relative h-4 bg-gray-300 rounded-full mb-4">
      <div className={`absolute h-4 bg-${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

const NextComponent = () => {
  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900">
      <div className="flex justify-between items-center bg-green-200 p-2 rounded-lg mb-4">
        <div className="flex items-center space-x-2">
          <PartnerBadge tier={"green"} text="Junior Partner" />
          <PartnerBadge tier={"green"} text="Associate Partner (Tier 2)" />
          <PartnerBadge tier={"green"} text="Associate Partner (Tier 1)" />
          <PartnerBadge tier={"green"} text="Senior Partner (Tier 2)" />
          <PartnerBadge tier={"green"} text="Senior Partner (Tier 1)" />
          <PartnerBadge tier={"yellow"} text="Managing Partner" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Open-ended Production</h2>
            <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-sm">27.44%</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Current</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">$82,325.66</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Remaining</p>
              <p className="text-2xl font-bold text-gray-400">$217,674.34</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Goal</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">$300,000.00</p>
            </div>
          </div>
          <ProgressBar percentage={27.44} color="blue-500" />
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
              <span className="text-gray-800 dark:text-gray-200">Me</span>
              <span className="ml-auto text-gray-600 dark:text-gray-400">$7,325.66 (2.44%)</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-blue-300 rounded-full mr-2"></span>
              <span className="text-gray-800 dark:text-gray-200">Bridget Barnhardt</span>
              <span className="ml-auto text-gray-600 dark:text-gray-400">Maxed $75,000.00 (25%)</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></span>
              <span className="text-gray-800 dark:text-gray-200">Diego Armas Morales</span>
              <span className="ml-auto text-gray-600 dark:text-gray-400">$0.00 (0%)</span>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Fast Track Production</h2>
            <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-sm">25.04%</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Current</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">$43,822.21</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Remaining</p>
              <p className="text-2xl font-bold text-gray-400">$131,177.79</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Goal</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">$175,000.00</p>
            </div>
          </div>
          <ProgressBar percentage={25.04} color="yellow-500" />
          <div className="flex justify-between items-center mb-4">
            <div className="relative h-4 bg-red-500 rounded-full w-1/3 mr-1">
              <div className="absolute inset-0 flex items-center justify-center text-white text-xs">March $28,656.37</div>
            </div>
            <div className="relative h-4 bg-green-500 rounded-full w-1/3 mx-1">
              <div className="absolute inset-0 flex items-center justify-center text-white text-xs">April $43,774.91</div>
            </div>
            <div className="relative h-4 bg-green-300 rounded-full w-1/3 ml-1">
              <div className="absolute inset-0 flex items-center justify-center text-white text-xs">May $19.79</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
              <span className="text-gray-800 dark:text-gray-200">Me</span>
              <span className="ml-auto text-gray-600 dark:text-gray-400">$72.21 (0.04%)</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-blue-300 rounded-full mr-2"></span>
              <span className="text-gray-800 dark:text-gray-200">Diego Armas Morales</span>
              <span className="ml-auto text-gray-600 dark:text-gray-400">$0.00 (0%)</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></span>
              <span className="text-gray-800 dark:text-gray-200">Bridget Barnhardt</span>
              <span className="ml-auto text-gray-600 dark:text-gray-400">Maxed $43,750.00 (25%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextComponent;

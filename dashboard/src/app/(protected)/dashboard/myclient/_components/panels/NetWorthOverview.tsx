import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign } from 'lucide-react';

type NetWorthOverviewProps = {
  clients: any[];
}

const NetWorthOverview: React.FC<NetWorthOverviewProps> = ({ clients }) => {
  const netWorthData = useMemo(() => {
    // Since the actual data doesn't include net worth, we'll use placeholder data
    const ranges = [
      { range: '0-100k', count: 0 },
      { range: '100k-250k', count: 0 },
      { range: '250k-500k', count: 0 },
      { range: '500k-1M', count: 0 },
      { range: '1M+', count: 0 },
    ];

    // Simulating net worth distribution
    clients.forEach(() => {
      const randomIndex = Math.floor(Math.random() * ranges.length);
      ranges[randomIndex].count++;
    });

    return ranges;
  }, [clients]);

  return (
    <div className="rounded-lg shadow-md p-4 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <DollarSign className="mr-2 text-yellow-500" />
        Net Worth Overview (Simulated)
      </h2>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={netWorthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NetWorthOverview;
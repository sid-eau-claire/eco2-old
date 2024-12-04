import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Briefcase } from 'lucide-react';

type OccupationAnalysisProps = {
  clients: any[];
}

const OccupationAnalysis: React.FC<OccupationAnalysisProps> = ({ clients }) => {
  const occupationData = useMemo(() => {
    const occupations: { [key: string]: number } = {};
    clients.forEach(client => {
      if (client.occupation) {
        occupations[client.occupation] = (occupations[client.occupation] || 0) + 1;
      }
    });

    return Object.entries(occupations)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);  // Top 5 occupations
  }, [clients]);

  return (
    <div className="rounded-lg shadow-md p-4 h-full">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Briefcase className="mr-2 text-green-500" />
        Top 5 Occupations
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={occupationData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OccupationAnalysis;
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Users } from 'lucide-react';

type ClientTypeDistributionProps = {
  clients: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const ClientTypeDistribution: React.FC<ClientTypeDistributionProps> = ({ clients }) => {
  const distributionData = useMemo(() => {
    const types = {
      person: 0,
      household: 0,
      organization: 0,
    };

    clients.forEach(client => {
      if (client.clientType in types) {
        types[client.clientType as keyof typeof types]++;
      }
    });

    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [clients]);

  return (
    <div className="rounded-lg shadow-md p-4 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Users className="mr-2 text-purple-500" />
        Client Type Distribution
      </h2>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distributionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {distributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClientTypeDistribution;
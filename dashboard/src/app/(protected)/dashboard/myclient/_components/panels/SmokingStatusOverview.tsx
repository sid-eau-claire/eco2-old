import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Cigarette } from 'lucide-react';

type SmokingStatusOverviewProps = {
  clients: any[];
}

const COLORS = ['#4CAF50', '#F44336'];

const SmokingStatusOverview: React.FC<SmokingStatusOverviewProps> = ({ clients }) => {
  const smokingData = useMemo(() => {
    const status = {
      'Non-Smoker': 0,
      'Smoker': 0,
    };

    const calculateAge = (dateOfBirth: any) => {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    clients.forEach(client => {
      const age = calculateAge(client.dateOfBirth);
      if (client.smokingStatus === 0 || age < 18) {
        status['Non-Smoker']++;
      } else if (client.smokingStatus === 1 && age >= 18) {
        status['Smoker']++;
      }
    });

    return Object.entries(status).map(([name, value]) => ({ name, value }));
  }, [clients]);

  return (
    <div className="rounded-lg shadow-md p-4 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Cigarette className="mr-2 text-red-500" />
        Smoking Status Overview
      </h2>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={smokingData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {smokingData.map((entry, index) => (
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

export default SmokingStatusOverview;

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserCheck } from 'lucide-react';

type ClientRetentionDashboardProps = {
  clients: any[];
}

const ClientRetentionDashboard: React.FC<ClientRetentionDashboardProps> = ({ clients }) => {
  const retentionData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearlyRetention: { [key: string]: number } = {};

    clients.forEach(client => {
      const createdYear = new Date(client.createdAt).getFullYear();
      const yearsRetained = currentYear - createdYear;
      const key = yearsRetained > 5 ? '5+' : yearsRetained.toString();
      yearlyRetention[key] = (yearlyRetention[key] || 0) + 1;
    });

    return Object.entries(yearlyRetention)
      .map(([years, count]) => ({ years, count }))
      .sort((a, b) => (a.years === '5+' ? 1 : Number(a.years)) - (b.years === '5+' ? 1 : Number(b.years)));
  }, [clients]);

  return (
    <div className="rounded-lg shadow-md p-4 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <UserCheck className="mr-2 text-green-500" />
        Client Retention
      </h2>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={retentionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="years" label={{ value: 'Years Retained', position: 'bottom' }} />
            <YAxis label={{ value: 'Number of Clients', angle: -90, position: 'left' }} />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClientRetentionDashboard;
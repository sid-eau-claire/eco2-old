import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

type ClientAcquisitionTimelineProps = {
  clients: any[];
}

const ClientAcquisitionTimeline: React.FC<ClientAcquisitionTimelineProps> = ({ clients }) => {
  const timelineData = useMemo(() => {
    const timeline: { [key: string]: number } = {};
    clients.forEach(client => {
      const date = new Date(client.dateOfOnboarding);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      timeline[yearMonth] = (timeline[yearMonth] || 0) + 1;
    });

    return Object.entries(timeline)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [clients]);

  return (
    <div className="rounded-lg shadow-md p-4 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <TrendingUp className="mr-2 text-blue-500" />
        Client Onboarding Timeline
      </h2>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClientAcquisitionTimeline;
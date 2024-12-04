import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { MapPin } from 'lucide-react';

type GeographicDistributionProps = {
  clients: any[];
}

const GeographicDistribution: React.FC<GeographicDistributionProps> = ({ clients }) => {
  const cityData = useMemo(() => {
    const cities: { [key: string]: number } = {};
    clients.forEach(client => {
      if (client.address && client.address.city) {
        cities[client.address.city] = (cities[client.address.city] || 0) + 1;
      }
    });

    return Object.entries(cities)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);  // Top 5 cities
  }, [clients]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="rounded-lg shadow-md p-4 h-full">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <MapPin className="mr-2 text-red-500" />
        Top 5 Client Cities
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={cityData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {cityData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GeographicDistribution;
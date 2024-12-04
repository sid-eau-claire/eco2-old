import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Users } from 'lucide-react';

type ClientAgeDistributionProps = {
  clients: any[];
  isPattern?: boolean;
}

const ClientAgeDistribution: React.FC<ClientAgeDistributionProps> = ({ clients, isPattern = true }) => {
  const ageGroups = useMemo(() => {
    const groups = {
      'Under 30': 0,
      '30-40': 0,
      '41-50': 0,
      '51-60': 0,
      'Over 60': 0
    };
    clients.forEach(client => {
      if (client.dateOfBirth) {
        const age = new Date().getFullYear() - new Date(client.dateOfBirth).getFullYear();
        if (age < 30) groups['Under 30']++;
        else if (age < 41) groups['30-40']++;
        else if (age < 51) groups['41-50']++;
        else if (age < 61) groups['51-60']++;
        else groups['Over 60']++;
      }
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [clients]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  const PATTERNS = [
    { id: 'lines', path: 'M 0 0 L 10 10 M -5 5 L 5 15 M 5 -5 L 15 5' },
    { id: 'circles', element: <circle cx="5" cy="5" r="3" /> },
    { id: 'squares', element: <rect x="2" y="2" width="6" height="6" /> },
    { id: 'waves', path: 'M 0 5 Q 2.5 0, 5 5 T 10 5' },
    { id: 'dots', element: <circle cx="5" cy="5" r="1" /> },
  ];

  return (
    <div className="rounded-lg shadow-md p-4 h-full">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Users className="mr-2 text-blue-500" />
        Client Age Distribution
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          {isPattern && (
            <defs>
              {PATTERNS.map((pattern, index) => (
                <pattern
                  key={pattern.id}
                  id={pattern.id}
                  patternUnits="userSpaceOnUse"
                  width="10"
                  height="10"
                  patternTransform="rotate(45)"
                >
                  {pattern.path ? (
                    <path d={pattern.path} stroke={COLORS[index]} strokeWidth="1" fill="none" />
                  ) : (
                    React.cloneElement(pattern.element as React.ReactElement, { fill: COLORS[index] })
                  )}
                </pattern>
              ))}
            </defs>
          )}
          <Pie
            data={ageGroups}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {ageGroups.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={isPattern ? `url(#${PATTERNS[index % PATTERNS.length].id})` : COLORS[index % COLORS.length]}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClientAgeDistribution;
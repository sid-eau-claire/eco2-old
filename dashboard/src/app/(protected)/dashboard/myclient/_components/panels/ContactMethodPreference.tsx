import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Phone } from 'lucide-react';

type ContactMethodPreferenceProps = {
  clients: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const ContactMethodPreference: React.FC<ContactMethodPreferenceProps> = ({ clients }) => {
  const contactData = useMemo(() => {
    const methods = {
      email: 0,
      homePhone: 0,
      mobilePhone: 0,
    };

    clients.forEach(client => {
      if (client.email) methods.email++;
      if (client.homePhone) methods.homePhone++;
      if (client.mobilePhone) methods.mobilePhone++;
    });

    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  }, [clients]);

  return (
    <div className="rounded-lg shadow-md p-4 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Phone className="mr-2 text-green-500" />
        Contact Method Preference
      </h2>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={contactData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {contactData.map((entry, index) => (
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

export default ContactMethodPreference;
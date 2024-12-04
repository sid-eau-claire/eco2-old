import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

type CaseSummaryProps = {
  cases: any[];
};

const COLORS = ['#0088FE', '#00C49F'];

const CaseSummary: React.FC<CaseSummaryProps> = ({ cases }) => {
  const totalCases = cases.length;
  const insuranceCases = cases.filter(c => c.caseType === 'Insurance').length;
  const investmentCases = cases.filter(c => c.caseType === 'Investment').length;
  const paidSettledCases = cases.filter(c => c.status === 'Paid Settled').length;

  const data = [
    { name: 'Insurance', value: insuranceCases },
    { name: 'Investment', value: investmentCases },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Briefcase className="mr-2" />
          Case Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Total Cases:</span>
            <span className="font-bold">{totalCases}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Insurance Cases:</span>
            <span className="font-bold">{insuranceCases}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Investment Cases:</span>
            <span className="font-bold">{investmentCases}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Paid Settled Cases:</span>
            <span className="font-bold">{paidSettledCases}</span>
          </div>
        </div>
        <div className="mt-4">
          <PieChart width={200} height={200}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={60}
              fill="#8884d8"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseSummary;

import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Shield, PieChart } from 'lucide-react';

type BusinessMetricsProps = {
  cases: any[];
};

const BusinessMetrics: React.FC<BusinessMetricsProps> = ({ cases }) => {
  const totalRevenue = cases.reduce((total, c) => total + (c.totalEstFieldRevenue || 0), 0);
  const totalPremium = cases.reduce((total, c) => total + (c.totalAnnualPremium || 0), 0);
  const totalCoverage = cases.reduce((total, c) => total + (c.totalCoverageFaceAmount || 0), 0);
  const totalAUM = cases.reduce((total, c) => total + (c.totalAnnualAUM || 0), 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2" />
          Business Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <DollarSign className="mr-2 h-4 w-4 text-green-500" />
          <div>
            <p className="text-sm font-medium">Est. Revenue</p>
            <p className="text-xl font-bold">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center">
          <DollarSign className="mr-2 h-4 w-4 text-blue-500" />
          <div>
            <p className="text-sm font-medium">Annual Premium</p>
            <p className="text-xl font-bold">${totalPremium.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center">
          <Shield className="mr-2 h-4 w-4 text-purple-500" />
          <div>
            <p className="text-sm font-medium">Total Coverage</p>
            <p className="text-xl font-bold">${totalCoverage.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center">
          <PieChart className="mr-2 h-4 w-4 text-orange-500" />
          <div>
            <p className="text-sm font-medium">Total AUM</p>
            <p className="text-xl font-bold">${totalAUM.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessMetrics;
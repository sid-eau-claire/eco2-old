import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type PerformanceIndicatorsProps = {
  currentMetrics: {
    revenue: number;
    premium: number;
    cases: number;
    opportunities: number;
  };
  previousMetrics?: {
    revenue: number;
    premium: number;
    cases: number;
    opportunities: number;
  };
};

const PerformanceIndicators: React.FC<PerformanceIndicatorsProps> = ({ currentMetrics, previousMetrics }) => {
  const calculateChange = (current: number, previous: number) => {
    if (!previous) return null;
    const percentChange = ((current - previous) / previous) * 100;
    return percentChange.toFixed(2);
  };

  const renderTrend = (change: string | null) => {
    if (!change) return <Minus className="h-4 w-4 text-gray-500" />;
    const changeNum = parseFloat(change);
    if (changeNum > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (changeNum < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2" />
          KPI (Client level)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Revenue</p>
            <p className="text-xl font-bold">${currentMetrics.revenue.toFixed(2)}</p>
            {previousMetrics && (
              <div className="flex items-center">
                {renderTrend(calculateChange(currentMetrics.revenue, previousMetrics.revenue))}
                <span className="ml-1 text-sm">
                  {calculateChange(currentMetrics.revenue, previousMetrics.revenue)}%
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Premium</p>
            <p className="text-xl font-bold">${currentMetrics.premium.toFixed(2)}</p>
            {previousMetrics && (
              <div className="flex items-center">
                {renderTrend(calculateChange(currentMetrics.premium, previousMetrics.premium))}
                <span className="ml-1 text-sm">
                  {calculateChange(currentMetrics.premium, previousMetrics.premium)}%
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Cases</p>
            <p className="text-xl font-bold">{currentMetrics.cases}</p>
            {previousMetrics && (
              <div className="flex items-center">
                {renderTrend(calculateChange(currentMetrics.cases, previousMetrics.cases))}
                <span className="ml-1 text-sm">
                  {calculateChange(currentMetrics.cases, previousMetrics.cases)}%
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Opportunities</p>
            <p className="text-xl font-bold">{currentMetrics.opportunities}</p>
            {previousMetrics && (
              <div className="flex items-center">
                {renderTrend(calculateChange(currentMetrics.opportunities, previousMetrics.opportunities))}
                <span className="ml-1 text-sm">
                  {calculateChange(currentMetrics.opportunities, previousMetrics.opportunities)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceIndicators;
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Target, DollarSign, PieChart } from 'lucide-react';

type OpportunityTrackerProps = {
  opportunities: any[];
};

const OpportunityTracker: React.FC<any> = ({ opportunities }) => {
  const totalOpportunities = opportunities.length;
  const totalEstAmount = opportunities.reduce((total: any, o: any) => total + (o.estAmount || 0), 0);
  const insuranceOpportunities = opportunities.filter((o: any) => o.type === 'Insurance').length;
  const investmentOpportunities = opportunities.filter((o: any) => o.type === 'Investment').length;
  const prospectOpportunities = opportunities.filter((o: any) => o.status === 'Prospect').length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="mr-2" />
          OppTy Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Open Opportunities:</span>
            <span className="font-bold">{totalOpportunities}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Total Est. Amount:</span>
            <span className="font-bold">
              <DollarSign className="inline-block h-4 w-4" />
              {totalEstAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Insurance Opportunities:</span>
            <span className="font-bold">{insuranceOpportunities}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Investment Opportunities:</span>
            <span className="font-bold">{investmentOpportunities}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Prospect Opportunities:</span>
            <span className="font-bold">{prospectOpportunities}</span>
          </div>
        </div>
        {/* <div className="mt-4">
          <PieChart
            data={[
              { name: 'Insurance', value: insuranceOpportunities },
              { name: 'Investment', value: investmentOpportunities },
            ]}
            width={200}
            height={200}
          />
        </div> */}
      </CardContent>
    </Card>
  );
};

export default OpportunityTracker;
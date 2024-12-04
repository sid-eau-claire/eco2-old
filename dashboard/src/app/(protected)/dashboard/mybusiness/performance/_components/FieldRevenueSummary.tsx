import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { fetchPersonalYTDMetric, fetchTeamYTDMetric } from '../_actions/newcase';
import { formatCurrency } from '@/lib/format';
import { Skeleton } from "@/components/ui/skeleton";

interface FieldRevenueSummaryProps {
  profileId: string;
}

const FieldRevenueSummary: React.FC<FieldRevenueSummaryProps> = ({ profileId }) => {
  const [isPersonal, setIsPersonal] = useState(true);
  const [personalData, setPersonalData] = useState<any[]>([]);
  const [teamData, setTeamData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const currentYear = new Date().getFullYear();
        const personalResponse = await fetchPersonalYTDMetric(profileId, currentYear * 100 + 12);
        const teamResponse = await fetchTeamYTDMetric(profileId, currentYear * 100 + 12);

        if (personalResponse?.data[0] && teamResponse?.data[0]) {
          const personalSettledRevenue = personalResponse.data[0].settledRevenueFromTransaction?.monthlyBreakdown || [];
          setPersonalData(monthNames.map((month, index) => ({
            name: month,
            revenue: personalSettledRevenue[index] || 0
          })));

          const teamSettledRevenue = teamResponse.data[0].teamMembers.reduce((acc: number[], member: any) => {
            member.settledRevenueFromTransaction?.monthlyBreakdown.forEach((value: number, index: number) => {
              acc[index] = (acc[index] || 0) + value;
            });
            return acc;
          }, []);
          setTeamData(monthNames.map((month, index) => ({
            name: month,
            revenue: teamSettledRevenue[index] || 0
          })));
        } else {
          throw new Error('No data received from the server');
        }
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        setError('Failed to fetch revenue data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [profileId]);

  const currentData = isPersonal ? personalData : teamData;

  const renderSkeletonChart = () => (
    <div className="h-[400px] flex items-center justify-center">
      <Skeleton className="w-full h-full" />
    </div>
  );

  const renderChart = () => (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="name" />
          <YAxis
            tickFormatter={(value) => `$${formatCurrency(value, true)}`}
          />
          <Tooltip
            formatter={(value) => [`$${formatCurrency(Number(value))}`, 'Revenue']}
          />
          <Legend />
          <Bar dataKey="revenue" fill="#8884d8" name="Settled Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  if (error) {
    return <div className="text-red-500 text-center text-sm">{error}</div>;
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Settled Revenue by Month</CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              id="revenue-toggle"
              checked={isPersonal}
              onCheckedChange={setIsPersonal}
            />
            <Label htmlFor="revenue-toggle">{isPersonal ? 'Personal' : 'Team'}</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? renderSkeletonChart() : renderChart()}
      </CardContent>
    </Card>
  );
};

export default FieldRevenueSummary;
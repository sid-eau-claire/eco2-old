import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPersonalYTDMetric } from '../_actions/newcase';
import { fetchTeamYTDMetric } from '../_actions/newcase';
import { formatCurrency } from '@/lib/format';
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryItem {
  title: string;
  cases: number;
  revenue: number;
}

interface KPISummaryProps {
  profileId: string;
}

const KPISummary: React.FC<KPISummaryProps> = ({ profileId }) => {
  const [personalSummary, setPersonalSummary] = useState<SummaryItem[]>([]);
  const [teamSummary, setTeamSummary] = useState<SummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const currentYear = new Date().getFullYear();
        const personalResponse = await fetchPersonalYTDMetric(profileId, currentYear * 100 + 12);
        const teamResponse = await fetchTeamYTDMetric(profileId, currentYear * 100 + 12);

        if (personalResponse?.data[0] && teamResponse?.data[0]) {
          const personalData = personalResponse.data[0];
          const teamData = teamResponse.data[0];

          setPersonalSummary([
            { title: 'Opportunities', cases: personalData.totalNoOfOpportunity || 0, revenue: personalData.totalOpportunityEstFieldRevenue || 0 },
            { title: 'Submitted', cases: personalData.totalNoOfCases || 0, revenue: personalData.totalEstFieldRevenue || 0 },
            { title: 'In the Mill', cases: personalData.totalNoOfCaseInTheMill || 0, revenue: personalData.totalEstFieldRevenueInTheMill || 0 },
            { title: 'Settled', cases: personalData.totalNoOfSettled || 0, revenue: personalData.settledRevenueFromTransaction?.total || 0 },
          ]);

          const totalTeamOpportunities = teamData.teamMembers.reduce((sum: number, member: any) => sum + (member.totalNoOfOpportunity || 0), 0);
          const totalTeamOpportunityRevenue = teamData.teamMembers.reduce((sum: number, member: any) => sum + (member.totalOpportunityEstFieldRevenue || 0), 0);
          const totalTeamSettled = teamData.teamMembers.reduce((sum: number, member: any) => sum + (member.settledRevenueFromTransaction?.total || 0), 0);

          setTeamSummary([
            { title: 'Opportunities', cases: totalTeamOpportunities, revenue: totalTeamOpportunityRevenue },
            { title: 'Submitted', cases: teamData.totalNoOfCases || 0, revenue: teamData.totalEstFieldRevenue || 0 },
            { title: 'In the Mill', cases: teamData.totalNoOfCaseInTheMill || 0, revenue: teamData.totalEstFieldRevenueInTheMill || 0 },
            { title: 'Settled', cases: teamData.totalNoOfSettled || 0, revenue: totalTeamSettled },
          ]);
        } else {
          throw new Error('No data received from the server');
        }
      } catch (error) {
        console.error('Error fetching KPI data:', error);
        setError('Failed to fetch KPI data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [profileId]);

  const renderSummaryRow = (summaryData: SummaryItem[], title: string) => (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {summaryData.map((item, index) => (
          <Card key={index} className="w-full">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-md font-semibold text-center">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-3">
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <p className="text-3xl font-bold">
                    {item.cases.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    cases
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">
                    {formatCurrency(item.revenue, true)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.title === 'Settled' ? 'Revenue' : 'Est. Revenue'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSkeletonRow = (title: string) => (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="w-full">
            <CardHeader className="py-2 px-3">
              <Skeleton className="h-6 w-full" />
            </CardHeader>
            <CardContent className="py-2 px-3">
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-8 w-20 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (error) {
    return <div className="text-red-500 text-center text-sm">{error}</div>;
  }

  return (
    <div className="space-y-4 px-[1.4rem]">
      {isLoading ? (
        <>
          {renderSkeletonRow('Personal KPI')}
          {renderSkeletonRow('Team KPI')}
        </>
      ) : (
        <>
          {renderSummaryRow(personalSummary, 'Personal KPI')}
          {renderSummaryRow(teamSummary, 'Team KPI')}
        </>
      )}
    </div>
  );
};

export default KPISummary;
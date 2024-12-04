'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from '@/lib/format';
import { getokr } from '../_actions/getokr';
import { startOfMonth, endOfMonth, format } from 'date-fns';

interface MetricData {
  apps: number;
  appsGoal: number;
  mpe: number;
  mpeGoal: number;
  aum: number;
  aumGoal: number;
  recruits: number;
  recruitsGoal: number;
  contracted: number;
  contractedGoal: number;
}

interface OKRSummaryProps {
  advisor: number;
}

const OKRSummary: React.FC<OKRSummaryProps> = ({ advisor }) => {
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [metricData, setMetricData] = useState<MetricData | null>(null);

  useEffect(() => {
    const now = new Date();
    setCurrentMonth(now.toLocaleString('default', { month: 'long' }));

    const fetchMetricData = async () => {
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

      try {
        const response = await getokr(advisor, monthStart, monthEnd);
        const okrData = response[0];

        setMetricData({
          apps: okrData.insurance.numberOfCases,
          appsGoal: okrData.insurance.noCoreApp,
          mpe: okrData.insurance.totalAnnualPremium / 12,
          mpeGoal: okrData.insurance.coreMPE,
          aum: okrData.investment.totalAnnualAUM,
          aumGoal: okrData.investment.investmentAUM,
          recruits: okrData.teamBuilding.totalLicensed,
          recruitsGoal: okrData.teamBuilding.noOfLicensed,
          contracted: okrData.teamBuilding.totalSubscription,
          contractedGoal: okrData.teamBuilding.noOfSubscription,
        });
      } catch (error) {
        console.error('Error fetching OKR data:', error);
      }
    };

    fetchMetricData();
  }, [advisor]);

  const renderMetricCell = (value: number, goal: number, type: 'apps' | 'mpe' | 'aum' | 'recruits' | 'contracted') => (
    <div className="text-center">
      <div className={`font-bold text-3xl ${value >= goal ? "text-green-500" : ""}`}>
        {type === 'mpe' || type === 'aum' ? formatCurrency(value, true) : value}
      </div>
      <div className="text-xs text-gray-500">
        Goal: {type === 'mpe' || type === 'aum' ? formatCurrency(goal, true) : goal}
      </div>
    </div>
  );

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">OKR Summary - {currentMonth}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {metricData && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3 py-2">Category</TableHead>
                <TableHead className="w-1/3 py-2">Metric</TableHead>
                <TableHead className="w-1/3 py-2">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-lg py-1">Insurance</TableCell>
                <TableCell className="py-1">Apps</TableCell>
                <TableCell className="py-1">{renderMetricCell(metricData.apps, metricData.appsGoal, 'apps')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium py-1"></TableCell>
                <TableCell className="py-1">MPE</TableCell>
                <TableCell className="py-1">{renderMetricCell(metricData.mpe, metricData.mpeGoal, 'mpe')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-lg py-1">Investment</TableCell>
                <TableCell className="py-1">Apps</TableCell>
                <TableCell className="py-1">{renderMetricCell(metricData.apps, metricData.appsGoal, 'apps')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium py-1"></TableCell>
                <TableCell className="py-1">AUM</TableCell>
                <TableCell className="py-1">{renderMetricCell(metricData.aum, metricData.aumGoal, 'aum')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-lg py-1">Team Growth</TableCell>
                <TableCell className="py-1">Recruits</TableCell>
                <TableCell className="py-1">{renderMetricCell(metricData.recruits, metricData.recruitsGoal, 'recruits')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium py-1"></TableCell>
                <TableCell className="py-1">Contracted</TableCell>
                <TableCell className="py-1">{renderMetricCell(metricData.contracted, metricData.contractedGoal, 'contracted')}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default OKRSummary;
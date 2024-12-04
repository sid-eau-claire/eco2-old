'use client'
import React, { useState, useEffect } from 'react';
import { startOfQuarter, endOfQuarter, parseISO, format, addMonths, subMonths, endOfMonth } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from '@/lib/format';
import { getokr } from '../_actions/getokr';
import { getOKRSettings } from '../_actions/settings';
import EditRecord from './EditRecord'; // Import the EditRecord component

interface QuarterDetail {
  quarter: string;
  startDate: Date;
  endDate: Date;
  months: string[];
}

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
  status: string;
}

interface OKRSetting {
  year: number;
  month: number;
  allowedSettingTarget: boolean;
}

const Dashboard: React.FC<{ advisor: number }> = ({ advisor }) => {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [currentQuarter, setCurrentQuarter] = useState<QuarterDetail | null>(null);
  const [metricData, setMetricData] = useState<{ [key: string]: MetricData }>({});
  const [OKRSettings, setOKRSettings] = useState<OKRSetting[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const quarterStartDate = startOfQuarter(now);
    const quarterEndDate = endOfQuarter(now);
    const months = [quarterStartDate, addMonths(quarterStartDate, 1), addMonths(quarterStartDate, 2)]
      .map(date => format(date, 'MMM'));
    const quarter = `Q${Math.floor(now.getMonth() / 3) + 1}`;
    setCurrentQuarter({ quarter, startDate: quarterStartDate, endDate: quarterEndDate, months });
    const fetchOKRSettings = async () => {
      try {
        const response = await getOKRSettings();
        setOKRSettings(response?.data?.OKRMonthTargetSettings);
      } catch (error) {
        console.error('Error in getOKRSettings:', error);
      }
    }
    fetchOKRSettings();
  }, [showEditDialog]);

  useEffect(() => {
    if (currentQuarter) {
      fetchMetricData();
    }
  }, [currentQuarter, advisor]);

  const fetchMetricData = async () => {
    setIsLoading(true);
    setMetricData({}); // Clear existing data
    const data: { [key: string]: MetricData } = {};
    for (const month of currentQuarter!.months) {
      const monthStartDate = format(addMonths(currentQuarter!.startDate, currentQuarter!.months.indexOf(month)), 'yyyy-MM-dd');
      const monthEndDate = format(endOfMonth(parseISO(monthStartDate)), 'yyyy-MM-dd');
      
      try {
        const response = await getokr(advisor, monthStartDate, monthEndDate);
        const okrData = response[0];
        
        data[`${currentQuarter!.quarter}-${month}`] = {
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
          status: okrData.status
        };
      } catch (error) {
        console.error(`Error fetching data for ${month}:`, error);
      }
    }
    setMetricData(data);
    setIsLoading(false);
  };

  const navigateQuarter = (direction: 'prev' | 'next' | 'current') => {
    if (currentQuarter) {
      let newStartDate: Date;
      if (direction === 'prev') {
        newStartDate = subMonths(currentQuarter.startDate, 3);
      } else if (direction === 'next') {
        newStartDate = addMonths(currentQuarter.startDate, 3);
      } else {
        newStartDate = startOfQuarter(new Date());
      }
  
      const newEndDate = endOfQuarter(newStartDate);
      const months = [newStartDate, addMonths(newStartDate, 1), addMonths(newStartDate, 2)]
        .map(date => format(date, 'MMM'));
      const quarter = `Q${Math.floor(newStartDate.getMonth() / 3) + 1}`;
  
      setCurrentQuarter({ quarter, startDate: newStartDate, endDate: newEndDate, months });
      setYear(newStartDate.getFullYear());
    }
  };

  const renderMetricCell = (value: number | undefined, goal: number | undefined, type: 'apps' | 'mpe' | 'aum' | 'recruits' | 'contracted') => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[72px]">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }
    if (value === undefined || goal === undefined) {
      return <div className="text-center h-[72px]">-</div>;
    }
    return (
      <div className="h-[72px]">
        <div className={`font-bold text-3xl ${value >= goal && value !== 0 ? "text-green-500" : ""}`}>
          {type === 'mpe' || type === 'aum' ? formatCurrency(value, true) : value}
        </div>
        <div className="text-trueGray-400 text-sm">
          / Goal {type === 'mpe' || type === 'aum' ? formatCurrency(goal, true) : goal}
        </div>
      </div>
    );
  };

  const isEditableMonth = (month: string) => {
    if (!currentQuarter) return false;
    const monthDate = addMonths(currentQuarter.startDate, currentQuarter.months.indexOf(month));
    const monthNumber = monthDate.getMonth() + 1; // JavaScript months are 0-indexed
    const yearNumber = monthDate.getFullYear();

    return OKRSettings?.some(setting => 
      setting.year === yearNumber && 
      setting.month === monthNumber && 
      setting.allowedSettingTarget
    );
  };

  const handleEditClick = (month: string) => {
    if (!currentQuarter) return;
    const monthDate = addMonths(currentQuarter.startDate, currentQuarter.months.indexOf(month));
    const monthNumber = monthDate.getMonth() + 1;
    setSelectedMonth(monthNumber);
    setShowEditDialog(true);
  };

  if (!currentQuarter) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="text-sm text-gray-500">Loading OKR data...</span>
      </div>
    );
  } 
  // console.log('metricData', metricData);
  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-md flex justify-between items-center">
            <span>{year}/{currentQuarter.quarter}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]"></TableHead>
                <TableHead colSpan={2}>INSURANCE PRODUCTION</TableHead>
                <TableHead colSpan={2}>INVESTMENT PRODUCTION</TableHead>
                <TableHead colSpan={2}>TEAM GROWTH</TableHead>
              </TableRow>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Apps</TableHead>
                <TableHead>MPE</TableHead>
                <TableHead>Apps</TableHead>
                <TableHead>AUM</TableHead>
                <TableHead>Recruits</TableHead>
                <TableHead>Contracted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentQuarter.months.map((month, monthIndex) => {
                const data = metricData[`${currentQuarter.quarter}-${month}`] || {};
                const isEditable = isEditableMonth(month);
                return (
                  <TableRow key={monthIndex}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          {!isLoading && isEditable && metricData[`${currentQuarter.quarter}-${month}`]?.status === 'Not Set' && (
                            <Edit 
                              className="h-4 w-4 mr-2 inline-block cursor-pointer" 
                              onClick={() => handleEditClick(month)}
                            />
                          )}
                          <span className="text-lg mr-2">{month}</span>
                          <span className="text-sm text-gray-500">{year}</span>
                        </div>
                        <div className={`text-xs mt-1 ${metricData[`${currentQuarter.quarter}-${month}`]?.status === 'Waiting for Approval' ? 'text-orange-400' : ''}`}>
                          {metricData[`${currentQuarter.quarter}-${month}`]?.status || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{renderMetricCell(data.apps, data.appsGoal, 'apps')}</TableCell>
                    <TableCell>{renderMetricCell(data.mpe, data.mpeGoal, 'mpe')}</TableCell>
                    <TableCell>{renderMetricCell(data.apps, data.appsGoal, 'apps')}</TableCell>
                    <TableCell>{renderMetricCell(data.aum, data.aumGoal, 'aum')}</TableCell>
                    <TableCell>{renderMetricCell(data.recruits, data.recruitsGoal, 'recruits')}</TableCell>
                    <TableCell>{renderMetricCell(data.contracted, data.contractedGoal, 'contracted')}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className='flex flex-row justify-start space-x-4 items-center mt-4'>
            <Button variant="outline" size="sm" className='w-[6rem]' onClick={() => navigateQuarter('prev')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button variant="outline" size="sm" className='w-[6rem]' onClick={() => navigateQuarter('current')}>
              Current
            </Button>
            <Button variant="outline" size="sm" className='w-[6rem]' onClick={() => navigateQuarter('next')}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
      {showEditDialog && selectedMonth !== null && (
        <EditRecord
          advisor={advisor}
          year={year}
          month={selectedMonth}
          onClose={() => setShowEditDialog(false)}
        />
      )}
    </>
  );
}

export default Dashboard;
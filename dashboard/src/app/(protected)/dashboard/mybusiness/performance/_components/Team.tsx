'use client'
import React, { useMemo, useState, useEffect } from 'react';
import { PageContainer, ColContainer, RowContainer, PanelContainer } from '@/components/Containers';
import { Card, Text } from '@tremor/react';
import { ProfileIcon } from '@/components/Icons';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/format';
import { fetchTeamYTDMetric } from '../_actions/newcase';
import { ResponsiveContainer, YAxis, XAxis, Tooltip, Legend, BarChart as RechartsBarChart, Bar, LabelList } from 'recharts';
import { useRouter } from 'next/navigation';
import {Spinner} from '@/components/Common';
import { Switch } from '@/components/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Team = ({ profileId }: { profileId: string }) => {
  const router = useRouter();
  const [switchType, setSwitchType] = useState(false);
  const [chosenYear, setChosenYear] = useState(new Date().getFullYear());
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [casesByStageData, setCasesByStageData] = useState<any[]>([]);
  const currentMonthIndex = new Date().getMonth();
  const [months, setMonths] = useState<any[]>([]);
  const [caseSummary, setCaseSummary] = useState([
    // { title: 'Business Development', cases: 0, revenue: 0 },
    { title: 'Opportunities', cases: 0, revenue: 0 },
    { title: 'Submitted (YTD)', cases: 0, revenue: 0 },
    { title: 'In the Mill', cases: 0, revenue: 0 },
    { title: 'Settled (YTD)', cases: 0, revenue: 0 },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settledRevenueByMonth, setSettledRevenueByMonth] = useState<number[]>(Array(12).fill(0));

  const dataFormatter = (number: number) => Intl.NumberFormat('us').format(number).toString();

  const stages = [
    "Paid Settled",
    "Pending Pay",
    "UW/Approved",
    "UW/Processing",
    "Pending Review",
    "Unknown",
    "Lapse/Withdrawn",
    "Declined/Postponed",
    "Not Proceeded With"
  ];

  const initializeMonths = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.map(name => ({
      name,
      ...stages.reduce((acc, stage) => ({ ...acc, [stage.replace(/\//g, '_')]: 0 }), {}),
      Settled_Revenue: 0,
      cases: [],
      total: 0,
    }));
  };

  const processTeamData = (data: any) => {
    if (!data || !Array.isArray(data.teamMembers)) {
      throw new Error('Invalid data structure: teamMembers is missing or not an array');
    }

    const processedMonths:any = initializeMonths();
    const processedTeamMembers = data.teamMembers.map((member: any) => {
      if (!member || !Array.isArray(member.newCases)) {
        console.warn(`Invalid member data:`, member);
        return { ...member, months: initializeMonths() };
      }

      const memberMonths:any = initializeMonths();
      member.newCases.forEach((newCase: any) => {
        if (!newCase || typeof newCase.createdAt !== 'string' || typeof newCase.status !== 'string') {
          console.warn(`Invalid case data:`, newCase);
          return;
        }

        const date = new Date(newCase.createdAt);
        if (date.getFullYear() === chosenYear) {
          const monthIndex = date.getMonth();
          const stage = newCase.status.replace(/\//g, '_');
          if (stages.includes(newCase.status)) {
            memberMonths[monthIndex][stage] += newCase.totalEstFieldRevenue || 0;
            memberMonths[monthIndex].total += newCase.totalEstFieldRevenue || 0;
            processedMonths[monthIndex][stage] += newCase.totalEstFieldRevenue || 0;
            processedMonths[monthIndex].total += newCase.totalEstFieldRevenue || 0;
          }
          if (newCase.settledDate) {
            const settledDate = new Date(newCase.settledDate);
            if (settledDate.getFullYear() === chosenYear) {
              const settledMonthIndex = settledDate.getMonth();
              memberMonths[settledMonthIndex].Settled_Revenue += newCase.totalEstFieldRevenue || 0;
              processedMonths[settledMonthIndex].Settled_Revenue += newCase.totalEstFieldRevenue || 0;
            }
          }
          memberMonths[monthIndex].cases.push(newCase.id);
          processedMonths[monthIndex].cases.push(newCase.id);
        }
      });
      return { ...member, months: memberMonths };
    });

    setMonths(processedMonths);
    setTeamMembers(processedTeamMembers);

    const casesByStageData = stages.map(stage => ({
      stage,
      value: processedMonths.reduce((total: number, month: any) => total + month[stage.replace(/\//g, '_')], 0)
    }));
    setCasesByStageData(casesByStageData);

    // Calculate total Settled (YTD) revenue
    const totalSettledRevenue = data.teamMembers.reduce((sum: number, member: any) => {
      return sum + (member.settledRevenueFromTransaction?.total || 0);
    }, 0);

    // Update Settled Revenue by Month
    const updatedSettledRevenueByMonth = Array(12).fill(0);
    data.teamMembers.forEach((member: any) => {
      member.settledRevenueFromTransaction?.monthlyBreakdown.forEach((value: number, index: number) => {
        updatedSettledRevenueByMonth[index] += value;
      });
    });
    setSettledRevenueByMonth(updatedSettledRevenueByMonth);

    // Calculate total opportunity data
    const totalNoOfOpportunity = data.teamMembers.reduce((sum: number, member: any) => sum + (member.totalNoOfOpportunity || 0), 0);
    const totalOpportunityEstFieldRevenue = data.teamMembers.reduce((sum: number, member: any) => sum + (member.totalOpportunityEstFieldRevenue || 0), 0);

    // Update caseSummary
    setCaseSummary((prevSummary) => prevSummary.map((item) => {
      switch (item.title) {
        // case 'Business Development':
        case 'Opportunities':
          return { ...item, cases: totalNoOfOpportunity, revenue: totalOpportunityEstFieldRevenue };
        case 'Submitted (YTD)':
          return { ...item, cases: data.totalNoOfCases || 0, revenue: data.totalEstFieldRevenue || 0 };
        case 'In the Mill':
          return { ...item, cases: data.totalNoOfCaseInTheMill || 0, revenue: data.totalEstFieldRevenueInTheMill || 0 };
        case 'Settled (YTD)':
          return { ...item, cases: data.totalNoOfSettled || 0, revenue: totalSettledRevenue };
        default:
          return item;
      }
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchTeamYTDMetric(profileId, chosenYear * 100 + 12);
        const data = response?.data[0];
        // console.log('Team data:', data);

        if (data) {
          processTeamData(data);
        } else {
          throw new Error('No data received from the server');
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
        setError('Failed to fetch team data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [chosenYear, profileId]);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setChosenYear(Number(event.target.value));
  };

  const getYearOptions = useMemo(() => {
    const startYear = 2024;
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - startYear + 3 }, (_, i) => startYear + i - 1);
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <>
      <RowContainer className='flex flex-row justify-between items-center p-2 border-none bg-transparent mb-2'>
        <ProfileIcon profileId={profileId} />
        <select
          name="year"
          id="year"
          className="w-[6rem] border border-gray-300 rounded-md p-2"
          onChange={handleYearChange}
          value={chosenYear.toString()}
        >
          {getYearOptions.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </RowContainer>
      <ColContainer cols="4:4:2:1" className='mb-[1rem]'>
        {caseSummary.map((summary, index) => (
          <motion.div key={index}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + index * 0.2, duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
          >
            <Card className="mx-auto max-w-md">
              <h4 className="text-tremor-title font-semibold text-tremor-content dark:text-dark-tremor-content mb-6">
                {summary?.title}
              </h4>
              <div className='flex flex-row justify-between items-start'>
                <div className="">
                  <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                    {summary?.cases?.toFixed(1)}
                  </p>
                  <p className="flex items-center justify-between text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                    <span>cases</span>
                  </p>
                </div>
                <div className="">
                  <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                    {formatCurrency(summary?.revenue)}
                  </p>
                  <p className="flex items-center justify-end text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                    {index == 3 ? (
                      <span>Field Revenue</span>
                    ) : (
                      <span>Est. Field Revenue</span>
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </ColContainer>
      {isLoading ? (
        <Spinner fullscreen={false}/>
      ) : (
        <>
          <RowContainer className='mt-[0.5rem] rounded-lg shadow-lg'>
            <ResponsiveContainer width="100%" height={400}>
              <RechartsBarChart
                data={months}
                margin={{ top: 20, right: 30, left: 60, bottom: 5 }} 
              >
                <XAxis dataKey="name" />
                <YAxis
                  tickFormatter={(value) => `$${dataFormatter(value)}`}
                  label={{ value: 'Est. Field Revenue', angle: -90, position: 'insideLeft', dy: 60, dx: -40 }} 
                />
                <Tooltip formatter={(value: any) => `$${dataFormatter(value)}`} />
                <Legend wrapperStyle={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', padding: '10px 10px', fontSize: '11px' }} iconType="circle" />
                {stages.map((stage, index) => (
                  <Bar
                    key={stage}
                    dataKey={stage.replace(/\//g, '_')}
                    stackId="a"
                    fill={['#006400', '#27ae60', '#2ecc71', '#f39c12', '#f1c40f', '#95a5a6', '#d35400', '#c0392b', '#e74c3c'][index]}
                  />
                ))}
                <LabelList dataKey="total" position="top" formatter={(value: number) => `$${dataFormatter(value)}`} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </RowContainer>
          <Card className="mt-[1rem] rounded-lg shadow-lg">
            <Text className="mb-4 text-tremor-title font-semibold">Settled Revenue by Month</Text>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {months.map((month, index) => (
                      <TableHead key={index} className="text-center">
                        {month.name.toUpperCase()}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    {settledRevenueByMonth.map((value, index) => (
                      <TableCell key={index} className="text-center">
                        {formatCurrency(value || 0)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>
          <PanelContainer collapse={true} header="Active Partner Report" className='rounded-lg shadow-lg relative mt-4'>
            <div className="flex flex-row justify-end items-center mb-4 space-x-8 mr-4">
              <Switch
                label="Cases"
                name="switchType"
                isChecked={!switchType}
                onChange={() => setSwitchType(!switchType)}
                isEditable={true}
                className="mr-2"
              />
              <Switch
                label="Settled Revenue"
                name="switchType"
                isChecked={switchType}
                onChange={() => setSwitchType(!switchType)}
                isEditable={true}
                className="mr-2 ml-4"
              />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">ADVISOR NAME</TableHead>
                    <TableHead className="whitespace-nowrap">SENIOR PARTNER</TableHead>
                    <TableHead>CURRENT STATUS</TableHead>
                    {months.map((month: any, index: number) => (
                      <TableHead key={index}>
                        {month.name.toUpperCase()}
                      </TableHead>
                    ))}
                    <TableHead>TOTAL (YTD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {teamMembers
                    .slice()
                    .sort((a: any, b: any) => {
                      const totalYTD_a = switchType
                        ? a.settledRevenueFromTransaction?.total || 0
                        : a.months.reduce((sum: number, month: any) => sum + stages.reduce((acc: number, stage: string) => acc + month[stage.replace(/\//g, '_')], 0), 0);
                      const totalYTD_b = switchType
                        ? b.settledRevenueFromTransaction?.total || 0
                        : b.months.reduce((sum: number, month: any) => sum + stages.reduce((acc: number, stage: string) => acc + month[stage.replace(/\//g, '_')], 0), 0);
                      return totalYTD_b - totalYTD_a;
                    })
                    .map((member: any, index: number) => {
                      const totalCases = member.months.reduce((sum: number, month: any) => sum + month.cases.length, 0);
                      const lastThreeMonthsCases = member.months.slice(Math.max(0, currentMonthIndex - 2), currentMonthIndex + 1).reduce((sum: number, month: any) => sum + month.cases.length, 0);

                      let currentStatus = "Parked";
                      if (totalCases > 0) currentStatus = "Active";
                      if (lastThreeMonthsCases > 0) currentStatus = "Engaged";

                      const monthValues = switchType
                        ? member.settledRevenueFromTransaction?.monthlyBreakdown || Array(12).fill(0)
                        : member.months.map((month: any) => 
                            stages.reduce((acc: number, stage: string) => acc + month[stage.replace(/\//g, '_')], 0)
                          );

                      const totalYTD = switchType
                        ? member.settledRevenueFromTransaction?.total || 0
                        : member.months.reduce((sum: number, month: any) => 
                            sum + stages.reduce((acc: number, stage: string) => acc + month[stage.replace(/\//g, '_')], 0), 0
                          );

                      return (
                        <TableRow key={index} className={index % 2 === 0 ? 'bg-gray' : 'bg-white'}>
                          <TableCell className="whitespace-nowrap py-1">{`${member.firstName} ${member.lastName}`}</TableCell>
                          <TableCell className="whitespace-nowrap py-1">{member.parent}</TableCell>
                          <TableCell className={`py-1 ${currentStatus === 'Engaged' ? 'bg-green-300' : currentStatus === 'Active' ? 'bg-yellow-300' : ''}`}>
                            {currentStatus}
                          </TableCell>
                          {monthValues.map((value: number, index: number) => {
                            let bgColor = '';
                            if (value >= 2000) bgColor = 'bg-green-300';
                            else if (value >= 200 && value < 2000) bgColor = 'bg-yellow-300';
                            else if (value < 0) bgColor = 'bg-pink-300';

                            return (
                              <TableCell key={index} className={`py-1 ${bgColor}`}>
                                {formatCurrency(value)}
                              </TableCell>
                            );
                          })}
                          <TableCell className="py-1 font-bold">{formatCurrency(totalYTD)}</TableCell>
                        </TableRow>
                      );
                    })}
                  <TableRow>
                    <TableCell colSpan={3} className="font-bold text-center">TOTAL</TableCell>
                    {Array(12).fill(0).map((_, index) => {
                      const totalMonthValue = teamMembers.reduce((sum: number, member: any) => {
                        return sum + (switchType
                          ? member.settledRevenueFromTransaction?.monthlyBreakdown[index] || 0
                          : stages.reduce((acc: number, stage: string) => acc + (member.months[index]?.[stage.replace(/\//g, '_')] || 0), 0)
                        );
                      }, 0);
                      return <TableCell key={index} className="font-bold">{formatCurrency(totalMonthValue)}</TableCell>;
                    })}
                    <TableCell className="font-bold">
                      {formatCurrency(teamMembers.reduce((sum: number, member: any) => 
                        sum + (switchType
                          ? member.settledRevenueFromTransaction?.total || 0
                          : member.months.reduce((monthSum: number, month: any) => 
                              monthSum + stages.reduce((acc: number, stage: string) => acc + month[stage.replace(/\//g, '_')], 0), 0
                            )
                        ), 0
                      ))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </PanelContainer>
          <PanelContainer collapse={true} header="Cases By Stage" className='rounded-lg shadow-lg mt-4'>
            <ResponsiveContainer width="100%" height={500}>
              <RechartsBarChart
                data={casesByStageData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                barSize={20}
              >
                <XAxis type="number" tickFormatter={(value) => `$${dataFormatter(value)}`} />
                <YAxis type="category" dataKey="stage" width={150} />
                <Tooltip formatter={(value: any) => `$${dataFormatter(value)}`} />
                <Legend
                  wrapperStyle={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    padding: '10px 10px',
                    fontSize: '11px'
                  }}
                  iconType="circle"
                  formatter={() => 'Revenue'}
                />
                <Bar dataKey="value" fill="#f39c12">
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={(value: number) => `$${dataFormatter(value)}`}
                    style={{ fontSize: '12px', fill: 'black' }}
                  />
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </PanelContainer>
        </>
      )}
    </>
  );
};

export default Team;
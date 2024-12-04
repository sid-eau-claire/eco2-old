'use client'
import React, { useState, useEffect } from 'react';
import { PageContainer, ColContainer, RowContainer } from '@/components/Containers';
import { Card, Text } from '@tremor/react';
import { ProfileIcon } from '@/components/Icons';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/format';
import { fetchPersonalYTDMetric } from '../_actions/newcase';
import { ResponsiveContainer, YAxis, XAxis, Tooltip, Legend, BarChart as RechartsBarChart, Bar, LabelList } from 'recharts';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/navigation';
import {Spinner} from '@/components/Common';
import { fetchSettledRevenue } from '.././_actions/settledrevenue';

const Personal = ({ profileId }: { profileId: string }) => {
  const router = useRouter();
  const [caseSummary, setCaseSummary] = useState([
    // { title: 'Business Development', cases: 0, revenue: 0 },
    { title: 'Opportunities', cases: 0, revenue: 0 },
    { title: 'Submitted (YTD)', cases: 0, revenue: 0 },
    { title: 'In the Mill', cases: 0, revenue: 0 },
    { title: 'Settled (YTD)', cases: 0, revenue: 0 },
  ]);
  const [months, setMonths] = useState<any[]>([]);
  const [settledRevenueByMonth, setSettledRevenueByMonth] = useState<number[]>([]);
  const [casesByStageData, setCasesByStageData] = useState<any[]>([]);
  const [chosenYear, setChosenYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

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

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const initializeMonths = () => {
    return monthNames.map(name => ({
      name,
      ...stages.reduce((acc, stage) => ({ ...acc, [stage]: 0 }), {}),
      cases: [],
      total: 0,
    }));
  };

  const processNewCases = (newCases: any[]) => {
    const processedMonths: any = initializeMonths();

    newCases.forEach((caseItem: any) => {
      const date = new Date(caseItem.createdAt);
      if (date.getFullYear() === chosenYear) {
        const monthIndex = date.getMonth();
        const stage = caseItem.status;
        if (stages.includes(stage)) {
          processedMonths[monthIndex][stage] += caseItem.totalEstFieldRevenue;
          processedMonths[monthIndex].total += caseItem.totalEstFieldRevenue;
        }
        processedMonths[monthIndex].cases.push(caseItem.id);
      }
    });

    setMonths(processedMonths);

    const casesByStageData = stages.map(stage => ({
      stage,
      value: processedMonths.reduce((total: any, month: any) => total + month[stage], 0)
    }));
    setCasesByStageData(casesByStageData);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response: any = await fetchPersonalYTDMetric(profileId, chosenYear * 100 + 12);
        const data = response?.data[0];
        // console.log('fetchPersonalTTDMetric data', data);
        if (data) {
          setCaseSummary((prevSummary: any) => prevSummary.map((item: any) => {
            switch (item.title) {
              // case 'Business Development':
              case 'Opportunities':
                return {
                  ...item,
                  cases: data.totalNoOfOpportunity || 0,
                  revenue: data.totalOpportunityEstFieldRevenue || 0,
                };
              case 'Submitted (YTD)':
                return {
                  ...item,
                  cases: data.totalNoOfCases,
                  revenue: data.totalEstFieldRevenue,
                };
              case 'In the Mill':
                return {
                  ...item,
                  cases: data.totalNoOfCaseInTheMill,
                  revenue: data.totalEstFieldRevenueInTheMill,
                };
              case 'Settled (YTD)':
                return {
                  ...item,
                  cases: data.totalNoOfSettled,
                  revenue: data?.settledRevenueFromTransaction?.total || 0,
                };
              default:
                return item;
            }
          }));
          processNewCases(data.newCases);
          setSettledRevenueByMonth(data?.settledRevenueFromTransaction?.monthlyBreakdown || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [chosenYear, profileId]);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setChosenYear(Number(event.target.value));
  };

  const getYearOptions = () => {
    const startYear = 2024;
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - startYear + 3 }, (_, i) => startYear + i - 1);
  };

  return (
    <>
      <RowContainer className='flex flex-row justify-between items-center p-2 border-none bg-transparent mb-2 relative'>
        <ProfileIcon profileId={profileId} />
        <select
          name="year"
          id="year"
          className="w-[6rem] border border-gray-300 rounded-md p-2"
          onChange={handleYearChange}
          value={chosenYear.toString()}
        >
          {getYearOptions().map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </RowContainer>
      <ColContainer cols="4:4:2:1" className='mb-[1rem]'>
        {caseSummary.map((summary: any, index: number) => (
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
                    {index === 3 ? (
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
                  tickFormatter={(value: any) => `$${dataFormatter(value)}`}
                  label={{ value: 'Est. Field Revenue', angle: -90, position: 'insideLeft', dy: 60, dx: -40 }}
                />
                <Tooltip formatter={(value: any) => `$${dataFormatter(value)}`} />
                <Legend wrapperStyle={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', padding: '10px 10px', fontSize: '11px' }} iconType="circle" />
                {stages.map((stage: string, index: number) => (
                  <Bar
                    key={stage}
                    dataKey={stage}
                    stackId="a"
                    // fill={['#16a085', '#27ae60', '#2ecc71', '#f39c12', '#f1c40f', '#95a5a6', '#d35400', '#c0392b', '#e74c3c'][index]}
                    fill={['#006400', '#27ae60', '#2ecc71', '#f39c12', '#f1c40f', '#95a5a6', '#d35400', '#c0392b', '#e74c3c'][index]}
                    onClick={(data: any, index: number) => { router.push(`/dashboard/mybusiness/newcase/${profileId}/${months[index].cases.join(',')}`); }}
                    className='cursor-pointer'
                  />
                ))}
                <LabelList dataKey="total" position="top" formatter={(value: number) => `$${dataFormatter(value)}`} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </RowContainer>
          <Card className="mt-[1rem] rounded-lg shadow-lg">
            <Text className="mb-4 text-tremor-title font-semibold">Settled Revenue by Month</Text>
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table className="min-w-full bg-white table-fixed">
                <thead>
                  <tr className="bg-primary text-white">
                    {monthNames.map((month, index) => (
                      <th key={index} className="w-1/12 px-4 py-2 border">
                        {month.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {settledRevenueByMonth.map((revenue, index) => (
                      <td key={index} className={twMerge(`w-1/12 px-4 py-2 border text-center`, 
                        revenue > 0 ? 'text-[#006400] font-semibold' : '' )}
                      >
                        {formatCurrency(revenue)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
          <Card className='mt-[1rem] rounded-lg shadow-lg'>
            <Text className="mb-2 text-tremor-title font-semibold">Settled Revenue by Month</Text>
            <div style={{ width: '100%', height: '300px', minWidth: '300px', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart
                  data={settledRevenueByMonth.map((revenue, index) => ({ name: monthNames[index], Settled_Revenue: revenue }))}
                  margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis
                    width={50}
                    tickFormatter={(value: any) => `$${dataFormatter(value)}`}
                    label={{ value: 'Revenue', angle: -90, position: 'insideLeft', dy: 60, dx: -40 }}
                  />
                  <Tooltip />
                  <Legend
                    wrapperStyle={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      padding: '10px 10px',
                      fontSize: '11px'
                    }}
                    iconType="circle"
                    formatter={() => 'Paid Field Revenue'}
                  />
                  <Bar dataKey="Settled_Revenue" fill="#8884d8">
                    <LabelList
                      dataKey="Settled_Revenue"
                      position="top"
                      formatter={(value: number) => `$${dataFormatter(value)}`}
                      style={{ fontSize: '12px', fill: 'black' }}
                    />
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className='mt-[1rem] rounded-lg shadow-lg'>
            <Text className="mb-2 text-tremor-title font-semibold">Cases By Stage</Text>
            <ResponsiveContainer width="100%" height={500}>
              <RechartsBarChart
                data={casesByStageData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                barSize={20}
              >
                <XAxis type="number" tickFormatter={(value: any) => `$${dataFormatter(value)}`} />
                <YAxis type="category" dataKey="stage" width={150} />
                <Tooltip />
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
          </Card>
        </>
      )}
    </>
  );
};

export default Personal;
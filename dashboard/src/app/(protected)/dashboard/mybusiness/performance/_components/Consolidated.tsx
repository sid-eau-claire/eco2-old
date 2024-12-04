'use client'
import React, { useEffect, useState } from 'react';
import { eachMonthOfInterval, endOfMonth, format } from 'date-fns';
import { getokr } from '../_actions/getokr';
import { formatCurrency } from '@/lib/format';
import Spinner from '@/components/Loading/Spinner';
import { Card, ProgressBar } from '@tremor/react';
import Link from 'next/link';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { twMerge } from 'tailwind-merge';

interface Data {
  month: string;
  actualCoreApps: number;
  goalCoreApps: number;
  actualCoreMPE: number;
  goalCoreMPE: number;
  actualInvestmentApps: number;
  goalInvestmentApps: number;
  actualInvestmentAUM: number;
  goalInvestmentAUM: number;
  actualNoFieldRevenue: number;
  actualTotalFieldRevenue: number;
  goalNoFieldRevenue: number;
  goalTotalFieldRevenue: number;
  actualLicensed: number;
  actualSubscription: number;
  goalNoOfLicensed: number;
  goalNoOfSubscription: number;
  insuranceCases: any;
  investmentCases: any;
  settledRevenueCases: any;
}

const fetchData = async (advisor: number, startDate: string, endDate: string): Promise<Data[]> => {
  const monthParams = generateMonthParams(startDate, endDate);
  
  const okrData = await Promise.all(monthParams.map(({ month, start, end }) =>
    getokr(advisor, start, end).then(result => {
      const data = result[0];
      console.log('okrData', data)
      return {
        month,
        actualCoreApps: data.insurance.numberOfCases,
        goalCoreApps: data.insurance.noCoreApp,
        actualCoreMPE: data.insurance.totalAnnualPremium / 12,
        goalCoreMPE: data.insurance.coreMPE,
        actualInvestmentApps: data.investment.numberOfCases,
        goalInvestmentApps: data.investment.noInvestmentApp,
        actualInvestmentAUM: data.investment.totalAnnualAUM,
        goalInvestmentAUM: data.investment.investmentAUM,
        actualNoFieldRevenue: data.settledRevenue.numberOfCases,
        actualTotalFieldRevenue: data.settledRevenue.totalEstFieldRevenue,
        goalNoFieldRevenue: data.settledRevenue.noSettledRevenue,
        goalTotalFieldRevenue: data.settledRevenue.settledRevenue,
        actualLicensed: data.teamBuilding.totalLicensed,
        actualSubscription: data.teamBuilding.totalSubscription,
        goalNoOfLicensed: data.teamBuilding.noOfLicensed,
        goalNoOfSubscription: data.teamBuilding.noOfSubscription,
        insuranceCases: data.insurance.cases,
        investmentCases: data.investment.cases,
        settledRevenueCases: data.settledRevenue.cases,
        teamBuilding: data.teamBuilding
      };
    })
  ));

  return okrData;
};

const generateMonthParams = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const interval = eachMonthOfInterval({ start, end });
  return interval.map(date => {
    const startOfMonth = date;
    const endOfMonthDate: Date = endOfMonth(date);
    return {
      month: format(date, 'MMM'),
      start: startOfMonth.toISOString(),
      end: endOfMonthDate.toISOString()
    };
  });
};

const ProgressCard = ({ actual, goal, label }: { actual: number, goal: number, label: string }) => {
  const percentage = (actual / goal) * 100;

  return (
    <div className='mb-2'>
      <div className="col-span-3 flex flex-row justify-between items-center">
        <span className="flex flex-col justify-center items-start text-tremor-metric/2 font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {label === 'MPE' || label === 'AUM' || label === 'Revenue' ? formatCurrency(actual) : actual.toFixed(2)} <span className='text-tremor-title'>{label}</span>
        </span>
        <div className="flex flex-col justify-center items-end text-tremor-default/3 space-y-2 text-tremor-content dark:text-dark-tremor-content">
          <span>{label === 'MPE' || label === 'AUM' || label === 'Revenue' ? formatCurrency(goal) : goal}</span>
          <span>Goal</span>
        </div>
      </div>
      <ProgressBar
        value={percentage}
        color={percentage >= 100 ? 'green' : undefined}
        className="mt-2"
      />
    </div>
  );
};

const GroupedProgressCard = ({
  actualCoreApps, goalCoreApps, actualCoreMPE, goalCoreMPE, actualInvestmentApps, goalInvestmentApps,
  actualInvestmentAUM, goalInvestmentAUM, actualNoFieldRevenue, goalNoFieldRevenue,
  actualLicensed, goalNoOfLicensed, actualSubscription, goalNoOfSubscription,
  actualTotalFieldRevenue, goalTotalFieldRevenue, className, advisor, insuranceCases, investmentCases, settledRevenueCases
} : {
  actualCoreApps: number, goalCoreApps: number, actualCoreMPE: number, goalCoreMPE: number,
  actualInvestmentApps: number, goalInvestmentApps: number, actualInvestmentAUM: number,
  goalInvestmentAUM: number, actualNoFieldRevenue: number, goalNoFieldRevenue: number,
  actualTotalFieldRevenue: number, goalTotalFieldRevenue: number, 
  actualLicensed: number, goalNoOfLicensed: number, actualSubscription: number, goalNoOfSubscription: number,
  className?: string, advisor?: any,
  insuranceCases?: any, investmentCases?: any, settledRevenueCases?: any
}) => (
  <>
    <Card className={twMerge(`grid grid-cols-8 col-span-8 space-x-8 bg-transparent p-3`, className)}>
      <Link href={`/dashboard/mybusiness/newcase/${advisor}/${insuranceCases}`} className="col-span-2">
        <ProgressCard actual={actualCoreApps} goal={goalCoreApps} label="Apps" />
        <ProgressCard actual={actualCoreMPE} goal={goalCoreMPE} label="MPE" />
      </Link>
      <Link href={`/dashboard/mybusiness/newcase/${advisor}/${investmentCases}`} className="col-span-2">
        <ProgressCard actual={actualInvestmentApps} goal={goalInvestmentApps} label="Apps" />
        <ProgressCard actual={actualInvestmentAUM} goal={goalInvestmentAUM} label="AUM" />
      </Link>
      <Link href={`/dashboard/mybusiness/newcase/${advisor}/${settledRevenueCases}`} className="col-span-2">
        <ProgressCard actual={actualNoFieldRevenue} goal={goalNoFieldRevenue} label="Apps" />
        <ProgressCard actual={actualTotalFieldRevenue} goal={goalTotalFieldRevenue} label="Revenue" />
      </Link>
      <Link href={`/dashboard/mynetwork/${advisor}`} className="col-span-2">
        <ProgressCard actual={actualLicensed} goal={goalNoOfLicensed} label="Licensed" />
        <ProgressCard actual={actualSubscription} goal={goalNoOfSubscription} label="Subscription" />
      </Link>      
    </Card>
  </>
);

const Consolidated = ({ advisor, startDate, endDate, activeTab }: { advisor: any; startDate: string; endDate: string, activeTab: boolean }) => {
  const [data, setData] = useState<Data[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);
  const [expandedTotal, setExpandedTotal] = useState(false);

  useEffect(() => {
    fetchData(advisor, startDate, endDate).then(setData).catch(console.error);
  }, [advisor, startDate, endDate]);

  useEffect(() => {
    const currentMonth = format(new Date(), 'MMM');
    setExpandedMonths([currentMonth]);
  }, []);

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev =>
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const totalActualCoreApps = data.reduce((sum, item) => sum + item.actualCoreApps, 0);
  const totalGoalCoreApps = data.reduce((sum, item) => sum + item.goalCoreApps, 0);
  const totalActualCoreMPE = data.reduce((sum, item) => sum + item.actualCoreMPE, 0);
  const totalGoalCoreMPE = data.reduce((sum, item) => sum + item.goalCoreMPE, 0);
  const totalActualInvestmentApps = data.reduce((sum, item) => sum + item.actualInvestmentApps, 0);
  const totalGoalInvestmentApps = data.reduce((sum, item) => sum + item.goalInvestmentApps, 0);
  const totalActualInvestmentAUM = data.reduce((sum, item) => sum + item.actualInvestmentAUM, 0);
  const totalGoalInvestmentAUM = data.reduce((sum, item) => sum + item.goalInvestmentAUM, 0);
  const totalActualNoFiledRevenue = data.reduce((sum, item) => sum + item.actualNoFieldRevenue, 0);
  const totalActualFieldRevenue = data.reduce((sum, item) => sum + item.actualTotalFieldRevenue, 0);
  const totalGoalNoFieldRevenue = data.reduce((sum, item) => sum + item.goalNoFieldRevenue, 0);
  const totalGoalTotalFieldRevenue = data.reduce((sum, item) => sum + item.goalTotalFieldRevenue, 0);
  const totalActualLicensed = data.reduce((sum, item) => sum + item.actualLicensed, 0);
  const totalActualSubscription = data.reduce((sum, item) => sum + item.actualSubscription, 0);
  const totalGoalNoOfLicensed = data.reduce((sum, item) => sum + item.goalNoOfLicensed, 0);
  const totalGoalNoOfSubscription = data.reduce((sum, item) => sum + item.goalNoOfSubscription, 0);

  let totalInsuranceCases: any[] = [];
  let totalInvestmentCases: any[] = [];
  let totalSettledRevenueCases: any[] = [];
  data.map(item => {
    totalInsuranceCases = totalInsuranceCases.concat(item.insuranceCases);
    totalInvestmentCases = totalInvestmentCases.concat(item.investmentCases);
    totalSettledRevenueCases = totalSettledRevenueCases.concat(item.settledRevenueCases);
  });

  return (
    <div className="px-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {data.length == 0 && activeTab && <Spinner />}
      {data.map(({ month, 
        actualCoreApps, goalCoreApps, actualCoreMPE, goalCoreMPE, 
        actualInvestmentApps, goalInvestmentApps, actualInvestmentAUM, goalInvestmentAUM, 
        actualNoFieldRevenue, actualTotalFieldRevenue, goalNoFieldRevenue, goalTotalFieldRevenue,
        actualLicensed, goalNoOfLicensed, actualSubscription, goalNoOfSubscription,
        insuranceCases, investmentCases, settledRevenueCases }, index) => (
        <React.Fragment key={index}>
          <div className="grid grid-cols-8 gap-x-4 gap-y-2 items-center mb-4">
            <button
              onClick={() => toggleMonth(month)}
              className="col-span-8 font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between w-[4rem]"
            >
              {month} {expandedMonths.includes(month) ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
            </button>
            {expandedMonths.includes(month) && (
              <>
                <div className="grid grid-cols-8 col-span-8">
                  <h4 className="col-span-2 font-bold text-lg text-center text-gray-700 dark:text-gray-300">Insurance Production</h4>
                  <h4 className="col-span-2 font-bold text-lg text-center text-gray-700 dark:text-gray-300">Investment Production</h4>
                  <h4 className="col-span-2 font-bold text-lg text-center text-gray-700 dark:text-gray-300">Settled Business</h4>
                  <h4 className="col-span-2 font-bold text-lg text-center text-gray-700 dark:text-gray-300">Team Building</h4>
                </div>
                <GroupedProgressCard
                  advisor={advisor}
                  actualCoreApps={actualCoreApps} goalCoreApps={goalCoreApps}
                  actualCoreMPE={actualCoreMPE} goalCoreMPE={goalCoreMPE}
                  actualInvestmentApps={actualInvestmentApps} goalInvestmentApps={goalInvestmentApps}
                  actualInvestmentAUM={actualInvestmentAUM} goalInvestmentAUM={goalInvestmentAUM}
                  actualNoFieldRevenue={actualNoFieldRevenue} goalNoFieldRevenue={goalNoFieldRevenue}
                  actualTotalFieldRevenue={actualTotalFieldRevenue} goalTotalFieldRevenue={goalTotalFieldRevenue}
                  actualLicensed={actualLicensed}  goalNoOfLicensed={goalNoOfLicensed} actualSubscription={actualSubscription} goalNoOfSubscription={goalNoOfSubscription}
                  insuranceCases={insuranceCases} investmentCases={investmentCases} settledRevenueCases={settledRevenueCases}
                />
              </>
            )}
          </div>
        </React.Fragment>
      ))}
      {data.length > 0 && (
        <>
          <div className="grid grid-cols-8 gap-x-4 gap-y-2 items-center mb-4">
            <button
              onClick={() => setExpandedTotal(!expandedTotal)}
              className="col-span-8 font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between w-[4rem] py-2"
            >
              Total {expandedTotal ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
            </button>
            {expandedTotal && (
              <>
                <div className="grid grid-cols-8 col-span-8">
                  <h4 className="col-span-2 font-bold text-lg text-center text-gray-700 dark:text-gray-300">Insurance Production</h4>
                  <h4 className="col-span-2 font-bold text-lg text-center text-gray-700 dark:text-gray-300">Investment Production</h4>
                  <h4 className="col-span-2 font-bold text-lg text-center text-gray-700 dark:text-gray-300">Settled Business</h4>
                  <h4 className="col-span-2 font-bold text-lg text-center text-gray-700 dark:text-gray-300">Team Building</h4>
                </div>
                <GroupedProgressCard
                  className="border-none" 
                  actualCoreApps={totalActualCoreApps} goalCoreApps={totalGoalCoreApps}
                  actualCoreMPE={totalActualCoreMPE} goalCoreMPE={totalGoalCoreMPE}
                  actualInvestmentApps={totalActualInvestmentApps} goalInvestmentApps={totalGoalInvestmentApps}
                  actualInvestmentAUM={totalActualInvestmentAUM} goalInvestmentAUM={totalGoalInvestmentAUM}
                  actualNoFieldRevenue={totalActualNoFiledRevenue} goalNoFieldRevenue={totalGoalNoFieldRevenue}
                  actualTotalFieldRevenue={totalActualFieldRevenue} goalTotalFieldRevenue={totalGoalTotalFieldRevenue}
                  actualLicensed={totalActualLicensed}  goalNoOfLicensed={totalGoalNoOfLicensed} actualSubscription={totalActualSubscription} goalNoOfSubscription={totalGoalNoOfSubscription}
                  advisor={advisor} insuranceCases={totalInsuranceCases} investmentCases={totalInvestmentCases} settledRevenueCases={totalSettledRevenueCases}
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Consolidated;

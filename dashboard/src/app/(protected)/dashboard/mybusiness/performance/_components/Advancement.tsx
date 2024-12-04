'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { fetchRanks, fetchTeamContributionForPromotion, fetchPersonalContributionForPromotion } from '../_actions/advancement';
import { ProgressBar, DonutChart } from "@tremor/react";
import { CheckCircle } from 'lucide-react';
import GameLikeRanks from './GameLikeRanks';

const rankColors: { [key: string]: string } = {
  'Junior Partner': 'bg-blue-500',
  'Associate Partner (Tier 2)': 'bg-indigo-500',
  'Associate Partner (Tier 1)': 'bg-purple-500',
  'Senior Partner (Tier 2)': 'bg-pink-500',
  'Senior Partner (Tier 1)': 'bg-red-500',
  'Managing Partner': 'bg-orange-500',
  'Managing Partner (AgencyMax)': 'bg-yellow-500',
  'Managing Partner (PersonalMax)': 'bg-green-500',
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
};


const Advancement = ({ profileId }: { profileId: string }) => {
  const [ranks, setRanks] = useState<any>([]);
  const [currentRank, setCurrentRank] = useState<any>(null);
  const [nextRank, setNextRank] = useState<any>(null);
  const [personalContributions, setPersonalContributions] = useState<any>(null);
  const [teamContributions, setTeamContributions] = useState<any>([]);
  // const [userData, setUserData] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [rankResponse, personalContributionsData, teamContributionsData] = await Promise.all([
        fetchRanks(),
        fetchPersonalContributionForPromotion(profileId),
        fetchTeamContributionForPromotion(profileId),
        // fetchDataForAdvancement(profileId)
      ]);

      let filteredRanks = rankResponse.data.filter((rank: any) => 
        ['Junior Partner', 'Associate Partner (Tier 2)', 'Associate Partner (Tier 1)', 
         'Senior Partner (Tier 2)', 'Senior Partner (Tier 1)'].includes(rank.name) ||
        rank.name.startsWith('Managing Partner')
      );

      // Combine Managing Partner ranks if necessary
      const managingPartners = filteredRanks.filter((rank: any) => rank.name.startsWith('Managing Partner'));
      if (managingPartners.length > 1) {
        const combinedMP = {
          ...managingPartners[0],
          name: 'Managing Partner',
          fastTrackProductionRequirement: Math.min(...managingPartners.map((mp:any) => mp.fastTrackProductionRequirement)),
          totalLifeTimeProductionRequirement: Math.min(...managingPartners.map((mp: any) => mp.totalLifeTimeProductionRequirement))
        };
        filteredRanks = filteredRanks.filter((rank: any) => !rank.name.startsWith('Managing Partner')).concat(combinedMP);
      }
      setRanks(filteredRanks);
      setPersonalContributions(personalContributionsData);
      setTeamContributions(teamContributionsData);
      // setUserData(userAdvancementData);

      // Set current and next rank based on user data
      const sortedRanks = filteredRanks.sort((a: any, b: any) => a.rankValue - b.rankValue);
      const currentRankIndex = sortedRanks.findIndex((rank: any) => 
        personalContributionsData.openEndRevenue >= rank.totalLifeTimeProductionRequirement &&
        (personalContributionsData.currentMonthRevenue + personalContributionsData.lastMonthRevenue + personalContributionsData.twoMonthAgoRevenue) >= rank.fastTrackProductionRequirement
      );
      setCurrentRank(sortedRanks[currentRankIndex !== -1 ? currentRankIndex : 0]);
      setNextRank(sortedRanks[currentRankIndex !== -1 ? Math.min(currentRankIndex + 1, sortedRanks.length - 1) : 0]);
    };

    fetchData();
  }, [profileId]);

  const calculateProgress = (current: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const calculateTeamContributions = (goal: number, revenueType: 'openEndRevenue' | 'fastTrackRevenue') => {
    const maxContribution = goal * 0.25;
    let totalTeamContribution = 0;

    const sortedTeams = Object.entries(teamContributions)
      .map(([key, value]: [string, any]) => {
        const members = Array.isArray(value) ? value : [value];
        return {
          key,
          totalRevenue: members.reduce((sum: number, member: any) => {
            if (revenueType === 'fastTrackRevenue') {
              return sum + (member.currentMonthRevenue || 0) + (member.lastMonthRevenue || 0) + (member.twoMonthAgoRevenue || 0);
            }
            return sum + (member[revenueType] || 0);
          }, 0),
          members
        };
      })
      .filter(team => team.totalRevenue > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    const contributions = sortedTeams.map((team, index) => {
      const teamContribution = Math.min(team.totalRevenue, maxContribution);
      totalTeamContribution += teamContribution;
      return {
        name: `Team ${index + 1}`,
        contribution: teamContribution,
        percentage: (teamContribution / goal) * 100,
        members: team.members.map((member: any) => ({
          name: member.fullName || 'Unknown Member',
          contribution: revenueType === 'fastTrackRevenue'
            ? Math.min((member.currentMonthRevenue || 0) + (member.lastMonthRevenue || 0) + (member.twoMonthAgoRevenue || 0), maxContribution)
            : Math.min(member[revenueType] || 0, maxContribution),
          percentage: (Math.min(revenueType === 'fastTrackRevenue'
            ? (member.currentMonthRevenue || 0) + (member.lastMonthRevenue || 0) + (member.twoMonthAgoRevenue || 0)
            : member[revenueType] || 0, maxContribution) / goal) * 100
        }))
      };
    });

    return {
      contributions,
      totalTeamContribution: Math.min(totalTeamContribution, goal * 0.25),
      totalTeamPercentage: Math.min((totalTeamContribution / goal) * 100, 25)
    };
  };

  const prepareChartData = (personalContribution: number, teamContributions: any[], total: number) => {
    let chartData = [{ name: 'Me', value: personalContribution }];

    let teamData = teamContributions.slice(0, 4).map(team => ({
      name: team.name,
      value: team.contribution
    }));

    if (teamContributions.length > 4) {
      const otherContribution = teamContributions.slice(4).reduce((sum, team) => sum + team.contribution, 0);
      teamData.push({ name: 'Others', value: otherContribution });
    }

    return chartData.concat(teamData);
  };

  if (!currentRank || !nextRank || Object.keys(teamContributions).length === 0 || !personalContributions) {
    return <div>Loading...</div>;
  }

  const openEndTeamContributions = calculateTeamContributions(nextRank.totalLifeTimeProductionRequirement, 'openEndRevenue');
  const fastTrackTeamContributions = calculateTeamContributions(nextRank.fastTrackProductionRequirement, 'fastTrackRevenue');

  const totalOpenEndRevenue = personalContributions.openEndRevenue + openEndTeamContributions.totalTeamContribution;
  const totalFastTrackRevenue = (personalContributions.currentMonthRevenue + personalContributions.lastMonthRevenue + personalContributions.twoMonthAgoRevenue) + fastTrackTeamContributions.totalTeamContribution;

  const openEndProgress = calculateProgress(totalOpenEndRevenue, nextRank.totalLifeTimeProductionRequirement);
  const fastTrackProgress = calculateProgress(totalFastTrackRevenue, nextRank.fastTrackProductionRequirement);

  const overallProgress = Math.max(openEndProgress, fastTrackProgress);
  const progressColor = openEndProgress > fastTrackProgress ? 'bg-blue-500' : 'bg-green-500';

  const openEndChartData = prepareChartData(personalContributions.openEndRevenue, openEndTeamContributions.contributions, totalOpenEndRevenue);
  const fastTrackChartData = prepareChartData(
    personalContributions.currentMonthRevenue + personalContributions.lastMonthRevenue + personalContributions.twoMonthAgoRevenue,
    fastTrackTeamContributions.contributions,
    totalFastTrackRevenue
  );

  return (
    <div className="mx-2 px-4 pt-2 bg-gray-100">
      <div className='flex flex-row justify-start items-center mb-2'>
        <h2 className="text-xl font-semibold">Career Advancement Progress</h2>
        <div className="flex justify-center">
          <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <SheetTrigger asChild>
              <div className='w-full flex justify-end items-center'>
                <span className='self-end text-xs bg-transparent text-warmGray-300 ml-2 hover:text-primary cursor-pointer' onClick={() => setIsDrawerOpen(true)}>(View Details)</span>
              </div>
            </SheetTrigger>
            <SheetContent side="right" className="w-fit md:min-w-[50vw] min-w-full pt-[0.8rem] h-full overflow-y-auto z-9999">
              <SheetHeader>
                <SheetTitle>Advancement Details</SheetTitle>
                <SheetDescription>
                  View your progress towards the next rank
                </SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Open-ended Production</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-600 text-sm">
                      <div className="mb-2">
                        <span className="font-medium">Current:</span> {formatCurrency(totalOpenEndRevenue)}
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Remaining:</span> {formatCurrency(nextRank.totalLifeTimeProductionRequirement - totalOpenEndRevenue)}
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Goal:</span> {formatCurrency(nextRank.totalLifeTimeProductionRequirement)}
                      </div>
                    </div>
                    <ProgressBar
                        value={openEndProgress}
                        label="Progress"
                        tooltip={`${formatCurrency(totalOpenEndRevenue)} / ${formatCurrency(nextRank.totalLifeTimeProductionRequirement)}`}
                        color="blue"
                      />
                    <DonutChart
                      data={openEndChartData}
                      category="value"
                      colors={['green', 'blue', 'orange', 'pink', 'purple', 'red']}
                      className="mt-6 h-60 text-2xl font-semibold"
                      valueFormatter={formatCurrency}
                      showLabel={true}
                      showAnimation={true}
                    />
                    <div className="mt-4">
                      <h4 className="text-md font-semibold">Personal Revenue</h4>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(personalContributions.openEndRevenue)} ({((personalContributions.openEndRevenue / nextRank.totalLifeTimeProductionRequirement) * 100).toFixed(2)}%)
                      </p>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-md font-semibold">Team Contributions</h4>
                      <ul className="text-sm text-gray-600">
                        {openEndTeamContributions.contributions.map((team, index) => (
                          <li key={index} className='mt-2'>
                            <span className="font-medium">{team.name}:</span> <span className='font-semibold'>{formatCurrency(team.contribution)}</span> ({team.percentage.toFixed(2)}%)
                            <ul className="pl-4">
                              {team.members.map((member, i) => (
                                <li key={i}>
                                  {member.name}: {formatCurrency(member.contribution)} ({member.percentage.toFixed(2)}%)
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Fast Track Production</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-600 text-sm">
                      <div className="mb-2">
                        <span className="font-medium">Current:</span> {formatCurrency(totalFastTrackRevenue)}
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Remaining:</span> {formatCurrency(nextRank.fastTrackProductionRequirement - totalFastTrackRevenue)}
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Goal:</span> {formatCurrency(nextRank.fastTrackProductionRequirement)}
                      </div>
                    </div>
                    <ProgressBar
                        value={fastTrackProgress}
                        label="Progress"
                        tooltip={`${formatCurrency(totalFastTrackRevenue)} / ${formatCurrency(nextRank.fastTrackProductionRequirement)}`}
                        color="green"
                      />
                    <DonutChart
                      data={fastTrackChartData}
                      category="value"
                      colors={['green', 'blue', 'orange', 'pink', 'purple', 'red']}
                      className="mt-6 h-60 text-2xl font-semibold"
                      valueFormatter={formatCurrency}
                      showLabel={true}
                      showAnimation={true}
                    />
                    <div className="mt-4">
                      <h4 className="text-md font-semibold">Personal Revenue</h4>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(personalContributions.currentMonthRevenue + personalContributions.lastMonthRevenue + personalContributions.twoMonthAgoRevenue)} 
                        ({(((personalContributions.currentMonthRevenue + personalContributions.lastMonthRevenue + personalContributions.twoMonthAgoRevenue) / nextRank.fastTrackProductionRequirement) * 100).toFixed(2)}%)
                      </p>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-md font-semibold">Team Contributions</h4>
                      <ul className="text-sm text-gray-600">
                        {fastTrackTeamContributions.contributions.map((team, index) => (
                          <li key={index} className='mt-2'>
                            <span className="font-medium">{team.name}:</span> <span className='font-semibold'>{formatCurrency(team.contribution)}</span> ({team.percentage.toFixed(2)}%)
                            <ul className="pl-4">
                              {team.members.map((member, i) => (
                                <li key={i}>
                                  {member.name}: {formatCurrency(member.contribution)} ({member.percentage.toFixed(2)}%)
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <GameLikeRanks 
        ranks={ranks} 
        currentRank={currentRank} 
        overallProgress={overallProgress} 
        progressColor={progressColor}
      />
      {overallProgress >= 100 && (
        <div className="flex justify-center items-center mt-4 text-green-600">
          <CheckCircle className="mr-2" />
          Congratulations! You've met the requirements for promotion.
          <span className='text-blue-600 font-semibold'>&nbsp;Send request</span>
        </div>
      )}
    </div>
  );
};

export default Advancement;
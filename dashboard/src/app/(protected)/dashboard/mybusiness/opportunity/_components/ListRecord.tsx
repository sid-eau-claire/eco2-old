'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { RowContainer, PageContainer } from '@/components/Containers';
import { MdAddCircle } from 'react-icons/md';
import { BiTable } from 'react-icons/bi';
import { FaTrello } from 'react-icons/fa';
import { RoundButton } from '@/components/Button';
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import CreateEditOpportunity from './CreateEditOpportunity';
import KanbanBoard from './KanbanBoard';
import { getOpportunities } from '../_actions/opportunities';
import { motion } from 'framer-motion';
import { CustomTable } from "@/components/ui/CustomTable";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BiDetail } from 'react-icons/bi';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MultiSelect, OptionType } from '@/components/ui/multiselect';
import { ToolTip } from '@/components/Common';
import { DialogTitle } from '@radix-ui/react-dialog';

const ListRecord = ({ profileId, oppId }: { profileId: string, oppId?: string }) => {
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTableView, setIsTableView] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [showEditRecord, setShowEditRecord] = useState(false);
  const [refreshData, setRefreshData] = useState<any>(1);

  const subStages = ['Prospect', 'Discovery', 'Planning', 'Plan Ready', 'Pending Close', 'Paper Work', 'In The Mill'];
  const intentions = ['Good', 'Stuck'];
  const types = ['Insurance', 'Investment'];

  const allOptions: OptionType[] = [...subStages, ...intentions, ...types].map(option => ({
    label: option,
    value: option
  }));

  const handleTagChange = (selected: string[]) => {
    setSelectedTags(selected);
  };

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const selectedSubStages = selectedTags.filter(tag => subStages.includes(tag));
    const selectedIntentions = selectedTags.filter(tag => intentions.includes(tag));
    const selectedTypes = selectedTags.filter(tag => types.includes(tag));

    const subStageMatch = selectedSubStages.length === 0 || selectedSubStages.includes(opportunity.status);
    const intentionMatch = selectedIntentions.length === 0 || selectedIntentions.includes(opportunity.intent);
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(opportunity.type);

    return subStageMatch && intentionMatch && typeMatch;
  });

  useEffect(() => {
    const fetchOpportunities = async () => {
      const response = await getOpportunities(profileId);
      const transformedOpportunities = response
        .filter((item: any) => item)
        .map((item: any) => {
          const { ...rest } = item;
          return {
            ...rest,
            items: [{ title: 'Process application', completed: false }],
            profileId: profileId,
          };
        });
      setOpportunities(transformedOpportunities);
    };
    fetchOpportunities();
  }, [profileId, refreshData ]);
  
  useEffect(() => {
    if (oppId) {
      setSelectedRecord(opportunities.find((opp) => opp._id === oppId));
      setShowEditRecord(true);
    }
  }, [opportunities]);

  const stages = [
    { 
      name: 'Prospect', 
      gradient: 'from-blue-700 to-blue-500', 
      subStages: ['Prospect'] 
    },
    { 
      name: 'Business Development', 
      gradient: 'from-orange-700 to-orange-500', 
      subStages: ['Discovery', 'Planning', 'Plan Ready'] 
    },
    { 
      name: 'Closing', 
      gradient: 'from-yellow-700 to-yellow-500', 
      subStages: ['Pending Close', 'Paper Work'] 
    },
    { 
      name: 'In The Mill', 
      gradient: 'from-green-700 to-green-500', 
      subStages: ['In The Mill'] 
    },
  ];

  const columns = useMemo(() => [
    {
      id: 'detail',
      header: () => <span className="font-semibold w-[1rem]"></span>,
      cell: (info: any) => (
        <ToolTip message='View Detail' hintHPos='2.2rem'>
          <button
            onClick={() => {setSelectedRecord(info.row.original); setShowEditRecord(true)}}
            className="hover:scale-110 transition duration-150 ease-in-out w-[0.5rem]"
          >
            <BiDetail className='cursor-pointer' size={30}/>
          </button>
        </ToolTip>
      ),
    },
    {
      accessorFn: (row: any) => row.clientId?.firstName + ' ' + row.clientId?.lastName,
      header: 'Client Name',
      id: 'client_name'
    },
    {
      accessorFn: (row: any) => row.type,
      header: 'Type',
      id: 'type'
    },
    {
      accessorFn: (row: any) => row.intent,
      header: 'Intent',
      id: 'intent'
    },
    {
      accessorFn: (row: any) => row.status,
      header: 'Status',
      id: 'status'
    },
    {
      accessorFn: (row: any) => row.estAmount ? row.estAmount.toLocaleString() : 'N/A',
      header: 'Estimated Amount',
      cell: (info: any) => `$${info.getValue()}`,
      id: 'est_amount'
    },
    {
      accessorFn: (row: any) => new Date(row.createdAt).toLocaleDateString(),
      header: 'Created Date',
      id: 'created_date'
    },
    {
      accessorFn: (row: any) => row.description,
      header: 'Description',
      id: 'description'
    }
  ], []);
  const { totalAUM, totalMPE } = useMemo(() => {
    return filteredOpportunities.reduce((totals, opp) => {
      if (opp.type === 'Investment') {
        totals.totalAUM += opp.estAmount || 0;
      } else if (opp.type === 'Insurance') {
        totals.totalMPE += opp.estAmount || 0;
      }
      return totals;
    }, { totalAUM: 0, totalMPE: 0 });
  }, [filteredOpportunities]);

  console.log('opportunities', opportunities);
  return (
    <PageContainer pageName="Opportunity">
      <Card className="mb-4">
        <CardContent className="flex justify-between items-center pt-6">
          <MultiSelect
            options={allOptions}
            selected={selectedTags}
            onChange={handleTagChange}
            placeholder="Filter by tags and type"
            className="w-[10rem]"
          />
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="font-semibold">{filteredOpportunities.length}</span> deals |  
              AUM: <span className="font-semibold">${totalAUM.toLocaleString()}</span> | 
              MPE: <span className="font-semibold">${totalMPE.toLocaleString()}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsTableView(!isTableView)}
            >
              {isTableView ? <FaTrello size={24} /> : <BiTable size={24} />}
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowAddRecord(true)}
                  >
                    <MdAddCircle size={24} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Add a new Opportunity
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
      {isTableView ? (
        <Card>
          <CardContent>
            <CustomTable
              columns={columns}
              data={filteredOpportunities}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4">
          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-stretch justify-between w-full h-16 relative">
                {stages.map((stage, index) => (
                  <div 
                    key={index} 
                    className={`h-[2.8rem] flex-1 relative flex items-center justify-center bg-gradient-to-r ${stage.gradient}`}
                    style={{
                      clipPath: index < stages.length - 1 
                        ? 'polygon(0 0, 87.5% 0, 100% 50%, 87.5% 100%, 0 100%, 12.5% 50%)'
                        : 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 12.5% 50%)'
                    }}
                  >
                    <span className="font-semibold text-white z-10">{stage.name}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-4">
                {stages.map((stage, index) => (
                  <div key={index} className="flex flex-col space-y-4">
                    {stage.subStages.map((subStage, subIndex) => (
                      <KanbanBoard
                        key={subIndex}
                        opportunities={filteredOpportunities.filter(
                          (opportunity) => opportunity.status === subStage
                        )}
                        profileId={profileId}
                        stage={subStage}
                        setRefreshData={setRefreshData}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <Dialog open={showAddRecord} onOpenChange={setShowAddRecord}>
        <DialogContent className="max-w-full min-h-screen h-screen overflow-y-auto flex flex-col justify-start z-[9999]">
          <DialogTitle/><DialogDescription/>
          <CreateEditOpportunity profileId={profileId} setShowAddRecord={setShowAddRecord} setRefreshData={setRefreshData}/>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default ListRecord;
import React, { useState, useEffect } from 'react';
import { createOpportunity, updateOpportunity, getClients, getOpportunityById, deleteOpportunity } from './../_actions/opportunities';
import { randomBytes } from 'crypto';
import { Loader } from '@/components/Common';
import OpportunityForm from './OpportunityForm';
import OpportunityDetails from './OpportunityDetails';
import OpportunityHistory from './OpportunityHistory';
import OpportunityCalendar from './OpportunityCalendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type ActivityType = {
  type: 'Call' | 'Meeting' | 'Task' | 'Deadline' | 'Email' | 'Lunch';
  subject: string;
  startDate: Date;
  endDate: Date;
  priority: 'Low' | 'Medium' | 'High';
  location: string;
  videoCallLink: string;
  description: string;
  status: 'Free' | 'Busy' | 'Out of Office';
  notes: string;
  participants: { name: string; email: string }[];
};

interface CreateEditOpportunityProps {
  profileId: string;
  opportunityId?: string | null;
  setShowAddRecord: (show: boolean) => void;
  setRefreshData: (refresh: string) => void;
}

const CreateEditOpportunity: React.FC<CreateEditOpportunityProps> = ({
  profileId,
  opportunityId = null,
  setShowAddRecord,
  setRefreshData
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [clients, setClients] = useState<any[]>([]);
  const [opportunityData, setOpportunityData] = useState<any>({
    profileId: profileId,
    description: '',
    type: 'Insurance',
    estAmount: 0,
    status: 'Prospect',
    clientId: '',
    intent: 'Good',
    activities: [],
    planningOptions: '',
    carrierId: '',
    productCategoryId: '',
    fundCategoryTypeId: '',
    notes: [],
    documents: []
  });
  const [newActivity, setNewActivity] = useState<ActivityType>({
    type: 'Call',
    subject: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 3600000),
    priority: 'Medium',
    location: '',
    videoCallLink: '',
    description: '',
    status: 'Free',
    notes: '',
    participants: []
  });
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      const clientsData = await getClients(profileId);
      setClients(clientsData);
    };

    fetchClients();
  }, [profileId]);

  useEffect(() => {
    const fetchOpportunityData = async () => {
      if (opportunityId) {
        setIsLoading(true);
        try {
          const data = await getOpportunityById(opportunityId);
          setOpportunityData({
            ...data,
            clientId: data?.clientId?.id.toString(),
            profileId: data?.profileId?.id.toString()
          });
          // setOpportunityData(data);
          
        } catch (error: any) {
          setErrorMessage(error.message || 'An error occurred while fetching opportunity data.');
          setErrorDialogOpen(true);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOpportunityData();
  }, [opportunityId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }) => {
    const { name, value } = e.target;
    setOpportunityData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleActivityInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }) => {
    const { name, value } = e.target;
    setNewActivity((prev: ActivityType) => ({ ...prev, [name]: value }));
  };

  const handlePlanningOptionsChange = (selectedOptions: string) => {
    setOpportunityData((prev: any) => ({
      ...prev,
      planningOptions: selectedOptions
    }));
  };

  const handleAddActivity = async (activity: ActivityType) => {
    setOpportunityData((prev: any) => ({
      ...prev,
      activities: [...(prev.activities || []), activity]
    }));
    setNewActivity({
      type: 'Call',
      subject: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 3600000),
      priority: 'Medium',
      location: '',
      videoCallLink: '',
      description: '',
      status: 'Free',
      notes: '',
      participants: []
    });
  };

  const handleNoteAdded = async (newNote: any) => {
    setOpportunityData((prev: any) => ({
      ...prev,
      notes: [...(prev.notes || []), { ...newNote, id: Date.now().toString(), createdAt: new Date() }]
    }));
  };

  const handleFileAdded = async (fileInfo: any, fileContentBase64: string) => {
    setOpportunityData((prev: any) => ({
      ...prev,
      documents: [...(prev.documents || []), { ...fileInfo, id: Date.now().toString(), url: '', uploadedAt: new Date() }]
    }));
  };

  const handleFileDeleted = async (fileId: string) => {
    setOpportunityData((prev: any) => ({
      ...prev,
      documents: (prev.documents || []).filter((file: any) => file.id !== fileId)
    }));
  };

  const handleActionClick = (action: string) => {
    setSelectedAction(action);
    setNewActivity(prev => ({ ...prev, type: action as ActivityType['type'] }));
  };

  const handleAddParticipant = () => {
    setNewActivity(prev => ({
      ...prev,
      participants: [...prev.participants, { name: '', email: '' }]
    }));
  };

  const handleParticipantChange = (index: number, field: string, value: string) => {
    setNewActivity(prev => {
      const updatedParticipants = [...prev.participants];
      updatedParticipants[index] = { ...updatedParticipants[index], [field]: value };
      return { ...prev, participants: updatedParticipants };
    });
  };

  const handleRemoveParticipant = (index: number) => {
    setNewActivity(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }));
  };

  const handleActivityChange = (updatedActivity: Partial<ActivityType>) => {
    setNewActivity(prev => ({ ...prev, ...updatedActivity }));
  };

  const updateCalendarTimeRange = (date: Date) => {
    // Implementation if needed
  };

  const handleSetSelectedDate = (date: Date | ((prevDate: Date) => Date)) => {
    const newDate = date instanceof Date ? date : date(newActivity.startDate);
    setNewActivity(prev => ({
      ...prev,
      startDate: newDate,
      endDate: new Date(newDate.getTime() + 3600000)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedOpportunityData = {
        ...opportunityData,
        activities: [...(opportunityData.activities || []), newActivity],
      };
      if (opportunityId) {
        await updateOpportunity(opportunityId, updatedOpportunityData);
      } else {
        await createOpportunity(updatedOpportunityData);
      }
      setShowAddRecord(false);
      setRefreshData(randomBytes(1).toString('hex'));
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred while saving the opportunity.');
      setErrorDialogOpen(true);
    }
  };

  const handleDelete = async () => {
    if (opportunityId && opportunityData.status === 'Prospect') {
      try {
        await deleteOpportunity(opportunityId);
        setShowAddRecord(false);
        setRefreshData(randomBytes(1).toString('hex'));
      } catch (error: any) {
        setErrorMessage(error.message || 'An error occurred while deleting the opportunity.');
        setErrorDialogOpen(true);
      }
    }
  };

  if (isLoading) return <Loader />;
  console.log('opportunityData', opportunityData);
  return (
    <div className="w-full bg-background pl-[2rem]">
      <form onSubmit={handleSubmit} className="h-full grid grid-cols-4 items-start">
        <div className='col-span-1'>
          <OpportunityForm
            opportunityData={opportunityData}
            handleInputChange={handleInputChange}
            handlePlanningOptionsChange={handlePlanningOptionsChange}
            clients={clients}
            setShowAddRecord={setShowAddRecord}
            setDeleteDialogOpen={setDeleteDialogOpen}
          />
        </div>
        <div className='col-span-2'>
          <OpportunityDetails 
            opportunityData={opportunityData}
            newActivity={newActivity}
            handleActivityInputChange={handleActivityInputChange}
            handleAddActivity={handleAddActivity}
            handleNoteAdded={handleNoteAdded}
            handleFileAdded={handleFileAdded}
            handleFileDeleted={handleFileDeleted}
            handleActionClick={handleActionClick}
            selectedAction={selectedAction}
            handleAddParticipant={handleAddParticipant}
            handleParticipantChange={handleParticipantChange}
            handleRemoveParticipant={handleRemoveParticipant}
            setNewActivity={setNewActivity}
            handleActivityChange={handleActivityChange}
            updateCalendarTimeRange={updateCalendarTimeRange}
            setSelectedDate={handleSetSelectedDate}
            clientName={clients.find((client: any) => client.id === opportunityData.clientId)?.firstName || ''}
            clientEmail={clients.find((client: any) => client.id === opportunityData.clientId)?.email || ''}
          />
          <OpportunityHistory opportunityData={opportunityData} />

        </div>
        <div className='col-span-1'>
          <OpportunityCalendar 
            newActivity={newActivity}
            setNewActivity={setNewActivity}
          />
        </div>
      </form>
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this opportunity? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CreateEditOpportunity;        
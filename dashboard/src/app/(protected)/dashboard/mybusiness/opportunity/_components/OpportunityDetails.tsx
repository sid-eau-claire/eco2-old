import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaFileAlt, FaStickyNote, FaCalendarAlt, FaFolder } from 'react-icons/fa';
import Activity from './Activity';
import Notes from './Notes';
import MeetingScheduler from './MeetingScheduler';
import Files from './Files';

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

interface OpportunityDetailsProps {
  opportunityData: any;
  newActivity: ActivityType;
  handleActivityInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }) => void;
  handleAddActivity: (newActivity: ActivityType) => Promise<void>;
  handleNoteAdded: (newNote: any) => Promise<void>;
  handleFileAdded: (fileInfo: any, fileContentBase64: string) => Promise<void>;
  handleFileDeleted: (fileId: string) => Promise<void>;
  handleActionClick: (action: string) => void;
  selectedAction: string | null;
  handleAddParticipant: () => void;
  handleParticipantChange: (index: number, field: string, value: string) => void;
  handleRemoveParticipant: (index: number) => void;
  setNewActivity: React.Dispatch<React.SetStateAction<ActivityType>>;
  handleActivityChange: (updatedActivity: Partial<ActivityType>) => void;
  updateCalendarTimeRange: (date: Date) => void;
  setSelectedDate: (date: Date | ((prevDate: Date) => Date)) => void;
  clientName: string;
  clientEmail: string;
}

const OpportunityDetails: React.FC<OpportunityDetailsProps> = ({ 
  opportunityData, 
  newActivity, 
  handleActivityInputChange, 
  handleAddActivity, 
  handleNoteAdded, 
  handleFileAdded, 
  handleFileDeleted,
  handleActionClick,
  selectedAction,
  handleAddParticipant,
  handleParticipantChange,
  handleRemoveParticipant,
  setNewActivity,
  handleActivityChange,
  updateCalendarTimeRange,
  setSelectedDate,
  clientName,
  clientEmail
}) => {
  const [activeTab, setActiveTab] = useState('Activity');
  const [expanded, setExpanded] = useState(true);

  const tabs = ['Activity', 'Notes', 'Meeting scheduler', 'Documents'];

  const tabIcons: { [key: string]: JSX.Element } = {
    Activity: <FaFileAlt size={18} />,
    Notes: <FaStickyNote size={18} />,
    'Meeting scheduler': <FaCalendarAlt size={18} />,
    Documents: <FaFolder size={18} />
  };

  const getIconForTab = (tab: string) => tabIcons[tab] || <FaFileAlt size={18} />;

  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <Card className="">
      <CardContent>
        <div className="flex justify-between items-center cursor-pointer mb-4" onClick={toggleExpanded}>
          <h2 className="text-lg font-semibold">Details</h2>
          {expanded ? '▼' : '▶'}
        </div>
        {expanded && (
          <Tabs defaultValue="Activity" className="w-full">
            <TabsList>
              {tabs.map((tab, index) => (
                <TabsTrigger key={index} value={tab} onClick={() => setActiveTab(tab)}>
                  {getIconForTab(tab)} <span className="ml-2">{tab}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="Activity">
              <Activity
                newActivity={newActivity}
                handleActivityInputChange={handleActivityInputChange}
                handleActionClick={handleActionClick}
                selectedAction={selectedAction}
                handleAddParticipant={handleAddParticipant}
                handleParticipantChange={handleParticipantChange}
                handleRemoveParticipant={handleRemoveParticipant}
                handleAddActivity={handleAddActivity}
                setNewActivity={setNewActivity}
                handleActivityChange={handleActivityChange}
                updateCalendarTimeRange={updateCalendarTimeRange}
                setSelectedDate={setSelectedDate}
                clientName={clientName}
                clientEmail={clientEmail}
              />
            </TabsContent>
            <TabsContent value="Notes">
              <Notes
                opportunityId={opportunityData.id || ''}
                notes={opportunityData.notes || []}
                onNoteAdded={handleNoteAdded}
              />
            </TabsContent>
            <TabsContent value="Meeting scheduler">
              <MeetingScheduler />
            </TabsContent>
            <TabsContent value="Documents">
              <Files
                opportunityId={opportunityData.id || ''}
                files={opportunityData.documents || []}
                onFileAdded={handleFileAdded}
                onFileDeleted={handleFileDeleted}
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default OpportunityDetails;
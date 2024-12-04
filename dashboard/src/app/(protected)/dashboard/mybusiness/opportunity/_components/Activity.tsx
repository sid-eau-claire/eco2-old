import React, { useState, useEffect } from 'react';
import { DateTimeRangePicker } from '@/components/ui/DateTimeRangePicker';
import { Phone, Users, Clock, FileText, Mail, Settings, MapPin, Video } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import AddressLocator from '@/components/ui/AddressLocator';
import { IoRestaurantSharp } from "react-icons/io5";

type Activity = {
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

type ActivityProps = {
  newActivity: Activity;
  handleActivityInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string | Date } }) => void;
  handleActionClick: (action: string) => void;
  selectedAction: string | null;
  handleAddParticipant: () => void;
  handleParticipantChange: (index: number, field: string, value: string) => void;
  handleRemoveParticipant: (index: number) => void;
  handleAddActivity: (newActivity: any) => void;
  setNewActivity: React.Dispatch<React.SetStateAction<Activity>>;
  handleActivityChange: (updatedActivity: Partial<Activity>) => void;
  updateCalendarTimeRange: (date: Date) => void;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  clientName: string;
  clientEmail: string;
};

const Activity: React.FC<ActivityProps> = ({
  newActivity,
  handleActivityInputChange,
  handleActionClick,
  selectedAction,
  handleAddParticipant,
  handleParticipantChange,
  handleRemoveParticipant,
  handleAddActivity,
  setNewActivity,
  handleActivityChange,
  updateCalendarTimeRange,
  setSelectedDate,
  clientName,
  clientEmail
}) => {
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isVideoCallDialogOpen, setIsVideoCallDialogOpen] = useState(false);
  const [tempVideoCallLink, setTempVideoCallLink] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedMapUrl, setSelectedMapUrl] = useState<string | null>(null);

  useEffect(() => {
    const defaultStartDate = new Date(new Date().setHours(8, 0, 0, 0));
    const defaultEndDate = new Date(new Date().setHours(9, 0, 0, 0));
    setNewActivity(prev => ({
      ...prev,
      startDate: defaultStartDate,
      endDate: defaultEndDate
    }));
  }, []);

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    console.log('activity start date', start);
    setNewActivity(prev => ({
      ...prev,
      startDate: start ? start : prev.startDate,
      endDate: end ? end : prev.endDate
    }));
    updateCalendarTimeRange(start ? start : new Date());
    setSelectedDate(start ? start : new Date());  
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewActivity(prev => ({ ...prev, [name]: value }));
    handleActivityInputChange({ target: { name, value } });
  };

  const handleAddressSelect = (address: string, mapUrl: string) => {
    setSelectedAddress(address);
    setSelectedMapUrl(mapUrl);
    setNewActivity(prev => ({ ...prev, location: address }));
    setIsLocationDialogOpen(false);
  };

  const handleVideoCallSubmit = () => {
    if (isValidUrl(tempVideoCallLink)) {
      setNewActivity(prev => ({ ...prev, videoCallLink: tempVideoCallLink }));
      setIsVideoCallDialogOpen(false);
    } else {
      alert('Please enter a valid URL');
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  // console.log('newActivity', newActivity)
  return (
    <div className="space-y-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Input
              type="text"
              name="subject"
              value={newActivity.subject}
              onChange={handleInputChange}
              placeholder="Subject"
            />
          </TooltipTrigger>
          <TooltipContent>
            Enter the subject of the activity
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="flex space-x-2">
        {[
          { type: 'Call', icon: Phone },
          { type: 'Meeting', icon: Users },
          { type: 'Task', icon: Clock },
          { type: 'Deadline', icon: FileText },
          { type: 'Email', icon: Mail },
          { type: 'Lunch', icon: IoRestaurantSharp },
        ].map(({ type, icon: Icon }) => (
          <TooltipProvider key={type}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={selectedAction === type ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => handleActionClick(type)}
                >
                  <Icon size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{type}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4">
        <DateTimeRangePicker
          startDate={newActivity.startDate}
          endDate={newActivity.endDate}
          setStartDate={(date) => handleDateRangeChange(date, null)}
          setEndDate={(date) => handleDateRangeChange(null, date)}
        />
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Select onValueChange={(value) => handleInputChange({ target: { name: 'priority', value } } as any)} value={newActivity.priority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className='z-9999'>
                <SelectItem value="Low">Low Priority</SelectItem>
                <SelectItem value="Medium">Medium Priority</SelectItem>
                <SelectItem value="High">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </TooltipTrigger>
          <TooltipContent>
            Set the priority of the activity
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="link" onClick={() => setIsLocationDialogOpen(true)}>
          <MapPin size={18} className="mr-1" /> Add location
        </Button>
        <Button type="button" variant="link" onClick={() => setIsVideoCallDialogOpen(true)}>
          <Video size={18} className="mr-1" /> Add video call
        </Button>
      </div>
      {selectedAddress && (
        <div className="mt-2">
          <p>Address: {selectedAddress}</p>
          <a href={selectedMapUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            View on OpenStreetMap
          </a>
        </div>
      )}
      {newActivity.videoCallLink && (
        <div className="mt-2">
          <a href={newActivity.videoCallLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Join Video Call
          </a>
        </div>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Select onValueChange={(value) => handleInputChange({ target: { name: 'status', value } } as any)} value={newActivity.status}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className='z-9999'>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Busy">Busy</SelectItem>
                <SelectItem value="Out of Office">Out of Office</SelectItem>
              </SelectContent>
            </Select>
          </TooltipTrigger>
          <TooltipContent>
            Set the status of the activity
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Textarea
              name="notes"
              value={newActivity.notes}
              onChange={handleInputChange}
              placeholder="Notes are visible within Eau Claires Dashboard, not to the event guests"
              className="h-32 bg-yellow-50"
            />
          </TooltipTrigger>
          <TooltipContent>
            Add notes for the activity
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div>
        <h3 className="font-semibold mb-2">Participants</h3>
        {newActivity.participants.map((participant, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    type="text"
                    value={participant.name}
                    onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                    placeholder="Name"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  Participant name
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    type="email"
                    value={participant.email}
                    onChange={(e) => handleParticipantChange(index, 'email', e.target.value)}
                    placeholder="Email"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  Participant email
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveParticipant(index)}>
                    ×
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Remove participant
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => {
          handleAddParticipant();
          // Pre-fill client and user information
          setNewActivity(prev => ({
            ...prev,
            participants: [
              { name: clientName, email: clientEmail },
              { name: "George Cheng", email: "george.cheng@eauclairepartners.com" }
            ]
          }));
        }}>+ Add Participant</Button>
      </div>
      <div className="flex justify-between items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <Checkbox id="markAsDone" />
                <label htmlFor="markAsDone">Mark as done</label>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              Mark activity as done
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="outline" className="mr-2" onClick={() => setNewActivity({ type: 'Call', subject: '', startDate: new Date(), endDate: new Date(Date.now() + 3600000), priority: 'Medium', location: '', videoCallLink: '', description: '', status: 'Free', notes: '', participants: [] })}>
                  Cancel
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Cancel the activity
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" onClick={()=>handleAddActivity(newActivity)}>
                  Add Activity
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Add the activity
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Location Dialog */}
      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Location</DialogTitle>
          </DialogHeader>
          <AddressLocator onAddressSelect={handleAddressSelect} />
          <DialogFooter>
            <Button type="button" onClick={() => setIsLocationDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Call Dialog */}
      <Dialog open={isVideoCallDialogOpen} onOpenChange={setIsVideoCallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Video Call Link</DialogTitle>
          </DialogHeader>
          <Input
            value={tempVideoCallLink}
            onChange={(e) => setTempVideoCallLink(e.target.value)}
            placeholder="Enter video call URL"
          />
          <DialogFooter>
            <Button type="button" onClick={handleVideoCallSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Call Dialog */}
      <Dialog open={isVideoCallDialogOpen} onOpenChange={setIsVideoCallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Video Call Link</DialogTitle>
          </DialogHeader>
          <Input
            value={tempVideoCallLink}
            onChange={(e) => setTempVideoCallLink(e.target.value)}
            placeholder="Enter video call URL"
          />
          <DialogFooter>
            <Button type="button" onClick={handleVideoCallSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Activity;
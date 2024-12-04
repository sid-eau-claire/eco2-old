import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FaRegClipboard, FaRegStickyNote, FaRegEnvelope } from 'react-icons/fa';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { PaperclipIcon, BoldIcon, ItalicIcon, UnderlineIcon, ListIcon, Link2Icon, ImageIcon, MoreHorizontalIcon } from 'lucide-react'
import { Client } from './types'
import { addActivityToClient,addNoteToClient } from '../_actions/client';

type PersonActivityProps = {
  client: Client;
  opportunities: any[];
  setRefresh?: (refresh: any) => void
}

export default function PersonActivity({ client, opportunities, setRefresh }: PersonActivityProps) {
  const [activityType, setActivityType] = useState('Call')
  const [activityNote, setActivityNote] = useState('')
  const [note, setNote] = useState('')
  const [emailTo, setEmailTo] = useState(client.email || '')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const { data: session } = useSession()

  useEffect(() => {
    setEmailTo(client.email || '')
    setEmailSubject(`Meeting with ${client.firstName} ${client.lastName}`)
  }, [client])

  // Calculate activity stats
  const calculateActivityStats = () => {
    const clientActivities = client.activities || [];
    const opportunityActivities = opportunities.flatMap(o => o.activities || []);
    const allActivities = [...clientActivities, ...opportunityActivities];
    
    const numInteractions = allActivities.length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedActivities = [...allActivities].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    
    const lastContactedDate = sortedActivities
      .filter(a => new Date(a.startDate) <= today)
      .slice(-1)[0]?.startDate 
      ? new Date(sortedActivities.filter(a => new Date(a.startDate) <= today).slice(-1)[0].startDate)
      : null;
    
    const nextContactedDate = sortedActivities
      .find(a => new Date(a.startDate) > today)?.startDate
      ? new Date(sortedActivities.find(a => new Date(a.startDate) > today)!.startDate)
      : null;
    
    const inactiveDays = lastContactedDate 
      ? Math.floor((today.getTime() - lastContactedDate.getTime()) / (1000 * 3600 * 24))
      : null;

    return { numInteractions, lastContactedDate, nextContactedDate, inactiveDays };
  }

  const { numInteractions, lastContactedDate, nextContactedDate, inactiveDays } = calculateActivityStats();

  const handleLogActivity = async () => {
    try {
      const newActivity = {
        type: activityType,
        subject: "Client Activity",
        startDate: new Date(),
        endDate: new Date(),
        priority: "Medium",
        location: "",
        videoCallLink: "",
        description: "",
        status: "Free",
        notes: activityNote,
        participants: []
      };
  
      await addActivityToClient(client.id, newActivity as any);
      alert(`${activityType} activity has been logged.`);
      setRefresh && setRefresh(Math.random());  
    } catch (error) {
      console.error('Error logging activity:', error);
      alert('Failed to log activity. Please try again.');
    }
  };

  const handleCreateNote = async () => {
    try {
      const newNote = {
        content: note, // Assuming 'note' is the state variable holding the note content
      };
  
      await addNoteToClient(client.id, newNote);
      alert("Your note has been saved.");
      setRefresh && setRefresh(Math.random()); // If you want to refresh the component
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note. Please try again.');
    }
  };

  const handleSendEmail = async () => {
    if (!session?.user?.googleAccessToken) {
      alert("You are not authenticated with Google. Please sign in again.")
      return
    }

    try {
      // Prepare the email content
      const email = [
        `To: ${emailTo}`,
        `Subject: ${emailSubject}`,
        '',
        emailMessage
      ].join('\r\n');

      const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      // Make a request to the Gmail API
      const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.user.googleAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: encodedEmail
        })
      });

      if (response.ok) {
        alert("Your email has been sent successfully.")
      } else {
        const errorData = await response.json();
        throw new Error(`Failed to send email: ${errorData.error.message}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert("Failed to send email. Please try again.");
    }
  }

  const handleCreateMeeting = () => {
    const eventTitle = `Meeting with ${client.firstName} ${client.lastName}`
    const encodedTitle = encodeURIComponent(eventTitle)
    const calendarUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodedTitle}`
    window.open(calendarUrl, '_blank')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{numInteractions}</div>
            <div className="text-sm text-gray-500">Interactions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xl font-bold">
              {lastContactedDate ? lastContactedDate.toLocaleDateString() : '--'}
            </div>
            <div className="text-sm text-gray-500">Last Contacted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xl font-bold">
              {nextContactedDate ? nextContactedDate.toLocaleDateString() : '--'}
            </div>
            <div className="text-sm text-gray-500">Next Contacted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{inactiveDays !== null ? inactiveDays : '--'}</div>
            <div className="text-sm text-gray-500">Inactive Days</div>
          </CardContent>
        </Card>
      </div>
      <TooltipProvider>
        <Tabs defaultValue="logActivity">
          <TabsList className="grid w-full grid-cols-3 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value="logActivity"
                  className="group flex justify-center items-center p-2 rounded transition-all duration-200 ease-in-out"
                >
                  <FaRegClipboard className="inline-block mr-2 text-gray-500 group-hover:text-blue-500 group-checked:text-white group-checked:bg-blue-500 group-checked:scale-110 group-checked:rounded-full transition-all duration-200" />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <span>Log your activities here</span>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value="createNote"
                  className="group flex justify-center items-center p-2 rounded transition-all duration-200 ease-in-out"
                >
                  <FaRegStickyNote className="inline-block mr-2 text-gray-500 group-hover:text-blue-500 group-checked:text-white group-checked:bg-blue-500 group-checked:scale-110 group-checked:rounded-full transition-all duration-200" />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <span>Create a new note</span>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value="sendEmail"
                  className="group flex justify-center items-center p-2 rounded transition-all duration-200 ease-in-out"
                >
                  <FaRegEnvelope className="inline-block mr-2 text-gray-500 group-hover:text-blue-500 group-checked:text-white group-checked:bg-blue-500 group-checked:scale-110 group-checked:rounded-full transition-all duration-200" />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <span>Send an email</span>
              </TooltipContent>
            </Tooltip>
          </TabsList>
          <TabsContent value="logActivity" className="space-y-4">
            <Select 
              value={activityType} 
              onValueChange={(value) => {
                setActivityType(value)
                if (value === 'Meeting') {
                  handleCreateMeeting()
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Call">Phone Call</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
              </SelectContent>
            </Select>
            <Textarea 
              placeholder="Click here to add a note" 
              value={activityNote}
              onChange={(e) => setActivityNote(e.target.value)}
            />
            <Button onClick={handleLogActivity}>Log Activity</Button>
          </TabsContent>

          <TabsContent value="createNote">
            <Textarea 
              placeholder="Click here to add a note" 
              className="min-h-[100px]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button onClick={handleCreateNote} className="mt-4">Create Note</Button>
          </TabsContent>

          <TabsContent value="sendEmail" className="space-y-4">
            <div className="flex justify-between">
              <Input 
                placeholder="TO" 
                className="w-3/4"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
              />
              <div className="space-x-2">
                <Button variant="outline" size="sm">CC</Button>
                <Button variant="outline" size="sm">BCC</Button>
              </div>
            </div>
            <Input 
              placeholder="Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
            <Textarea 
              placeholder="Message" 
              className="min-h-[200px]"
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <div className="space-x-2">
                <Button variant="outline" size="sm"><PaperclipIcon className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm"><BoldIcon className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm"><ItalicIcon className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm"><UnderlineIcon className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm"><ListIcon className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm"><Link2Icon className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm"><ImageIcon className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm"><MoreHorizontalIcon className="h-4 w-4" /></Button>
              </div>
              <Button onClick={handleSendEmail}>SEND</Button>
            </div>
          </TabsContent>
        </Tabs>
      </TooltipProvider>
    </div>
  )
}
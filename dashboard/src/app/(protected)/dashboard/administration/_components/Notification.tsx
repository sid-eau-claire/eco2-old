// app/components/NotificationComponent.tsx
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { searchUsers, findTeammates, getAdvisorNameList } from '../_actions/notification';
import { fetchRanks, fetchProfileIdsByRank, sendNotification } from '@/lib/strapi';

interface Rank {
  id: number;
  name: string;
}

interface Advisor {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  referralCode: string;
}

export function Notification() {
  const [recipientType, setRecipientType] = useState('rank');
  const [selectedRank, setSelectedRank] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Advisor[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [profileIds, setProfileIds] = useState<string[]>([]);
  const [advisorNameList, setAdvisorNameList] = useState<Advisor[]>([]);

  useEffect(() => {
    const fetchRanksData = async () => {
      const fetchedRanks = await fetchRanks();
      if (fetchedRanks && fetchedRanks.data) {
        setRanks(fetchedRanks.data);
      }
    };
    const fetchAdvisorNameList = async () => {
      const fetchedAdvisorNameList = await getAdvisorNameList();
      setAdvisorNameList(fetchedAdvisorNameList);
    }
    fetchRanksData();
    fetchAdvisorNameList();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length > 0) {
      const results = advisorNameList.filter(advisor => 
        (advisor.firstName && advisor.firstName.toLowerCase().includes(term.toLowerCase())) ||
        (advisor.middleName && advisor.middleName.toLowerCase().includes(term.toLowerCase())) ||
        (advisor.lastName && advisor.lastName.toLowerCase().includes(term.toLowerCase()))
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleRankSelection = async (value: string) => {
    setSelectedRank(value);
    const fetchedProfileIds = await fetchProfileIdsByRank(value);
    setProfileIds(fetchedProfileIds);
  };

  const handleAdvisorSelection = (advisor: Advisor) => {
    setSelectedRecipients([...selectedRecipients, advisor]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleRemoveRecipient = (id: number) => {
    setSelectedRecipients(selectedRecipients.filter(recipient => recipient.id !== id));
  };

  const handleTeamSearch = async () => {
    if (searchTerm) {
      const user = await searchUsers(searchTerm);
      if (user.length > 0) {
        const teammates = await findTeammates(user[0].id);
        setSelectedRecipients(teammates);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    let recipientIds: string[] = [];
    
    if (recipientType === 'rank') {
      recipientIds = profileIds;
    } else {
      recipientIds = selectedRecipients.map(recipient => recipient.id.toString());
    }

    try {
      const result = await sendNotification({
        recipientIds,
        title,
        message,
        link
      });
      if (result.success) {
        setStatusMessage("Notification sent successfully.");
      } else {
        setStatusMessage("Failed to send notification. Please try again.");
      }
    } catch (error) {
      setStatusMessage("An error occurred while sending the notification. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <RadioGroup value={recipientType} onValueChange={setRecipientType}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="rank" id="rank" />
          <Label htmlFor="rank">Rank</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="user" id="user" />
          <Label htmlFor="user">Individual User</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="team" id="team" />
          <Label htmlFor="team">Agency Team</Label>
        </div>
      </RadioGroup>

      {recipientType === 'rank' && (
        <div className="flex items-center space-x-4">
          <Select value={selectedRank} onValueChange={handleRankSelection}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a rank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ranks</SelectItem>
              {ranks?.length > 0 && ranks.map((rank) => (
                <SelectItem key={rank.id} value={rank.id.toString()}>{rank.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {profileIds.length > 0 && (
            <span className="text-sm text-gray-600">
              {profileIds.length} profile{profileIds.length !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
      )}

      {(recipientType === 'user' || recipientType === 'team') && (
        <div className="space-y-4">
          <div className="relative">
            <Input
              placeholder={recipientType === 'user' ? "Search users..." : "Search for team leader..."}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {recipientType === 'user' && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {searchResults.map((advisor) => (
                  <div
                    key={advisor.id}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleAdvisorSelection(advisor)}
                  >
                    {`${advisor.firstName} ${advisor.middleName || ''} ${advisor.lastName}`}
                  </div>
                ))}
              </div>
            )}
          </div>
          {recipientType === 'team' && (
            <Button type="button" onClick={handleTeamSearch}>Find Team</Button>
          )}
          {selectedRecipients.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Selected Recipients:</h3>
              {selectedRecipients.map((recipient) => (
                <div key={recipient.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span>{`${recipient.firstName} ${recipient.middleName || ''} ${recipient.lastName}`}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRecipient(recipient.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Input
        placeholder="Notification Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Textarea
        placeholder="Notification Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <Input
        placeholder="Link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />

      <Button type="submit">Send Notification</Button>

      {statusMessage && (
        <div className={`mt-4 p-4 ${statusMessage.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded-md`}>
          {statusMessage}
        </div>
      )}
    </form>
  );
}
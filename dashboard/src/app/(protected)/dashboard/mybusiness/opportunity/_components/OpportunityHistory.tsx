// File: OpportunityHistory.tsx
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FaFileAlt } from 'react-icons/fa';
import History from './History';

interface OpportunityHistoryProps {
  opportunityData: any;
}

const OpportunityHistory: React.FC<OpportunityHistoryProps> = ({ opportunityData }) => {
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = () => setExpanded(!expanded);

  const historyItems = [
    ...(opportunityData.activities || []).map((activity: any) => ({
      id: activity.id || '',
      type: 'activity',
      title: activity.subject,
      date: new Date(activity.startDate),
      creator: activity.participants[0]?.name || 'Unknown',
      content: activity.description,
      notes: activity.notes,
      participants: activity.participants.map((p: any) => p.name),
    })),
    ...(opportunityData.notes || []).map((note: any) => ({
      id: note.id,
      type: 'note',
      title: 'Note',
      date: new Date(note.createdAt),
      creator: 'System',
      content: note.content,
    })),
    ...(opportunityData.documents || []).map((doc: any) => ({
      id: doc.id,
      type: 'document',
      title: doc.name,
      date: new Date(doc.uploadedAt),
      creator: 'System',
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <Card className="mt-4">
      <CardContent>
        <div className="flex justify-between items-center cursor-pointer mb-4" onClick={toggleExpanded}>
          <div className="flex items-center">
            <FaFileAlt size={18} />
            <h2 className="text-lg font-semibold ml-2">History</h2>
          </div>
          {expanded ? '▼' : '▶'}
        </div>
        {expanded && <History items={historyItems} />}
      </CardContent>
    </Card>
  );
};

export default OpportunityHistory;
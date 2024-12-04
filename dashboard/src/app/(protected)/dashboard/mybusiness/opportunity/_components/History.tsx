import React, { useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { FaFile, FaFileAlt, FaStickyNote, FaEnvelope, FaFolder, FaExchangeAlt } from 'react-icons/fa';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type HistoryItem = {
  id: string;
  type: 'activity' | 'note' | 'email' | 'file' | 'document' | 'invoice' | 'changelog';
  title: string;
  date: string | Date;
  creator: string;
  content?: string;
  participants?: string[];
  relatedItems?: string[];
  notes: string;
};

type HistoryProps = {
  items: HistoryItem[];
};

const History: React.FC<HistoryProps> = ({ items }) => {
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case 'activity': return <FaFileAlt className="text-blue-500" />;
      case 'note': return <FaStickyNote className="text-green-500" />;
      case 'email': return <FaEnvelope className="text-yellow-500" />;
      case 'file': return <FaFile className="text-purple-500" />;
      case 'document': return <FaFile className="text-red-500" />;
      case 'invoice': return <FaFile className="text-indigo-500" />;
      case 'changelog': return <FaExchangeAlt className="text-pink-500" />;
      default: return <FaFolder className="text-gray-500" />;
    }
  };

  const parseDate = (date: string | Date): Date => {
    if (typeof date === 'string') {
      const parsedDate = parseISO(date);
      return isValid(parsedDate) ? parsedDate : new Date();
    }
    return date instanceof Date && isValid(date) ? date : new Date();
  };

  const sortedItems = [...items].sort((a, b) => 
    parseDate(b.date).getTime() - parseDate(a.date).getTime()
  );

  const filteredItems = selectedTab === 'all' 
    ? sortedItems 
    : sortedItems.filter(item => item.type === selectedTab);

  const formatDate = (date: string | Date) => {
    const parsedDate = parseDate(date);
    return format(parsedDate, 'MMM d, yyyy h:mm a');
  };

  const formatMonthDate = (date: string | Date) => {
    const parsedDate = parseDate(date);
    return format(parsedDate, 'MMM d');
  };

  return (
    <div className="mt-4">
      <div className="flex space-x-2 mb-4 overflow-x-auto">
        <button
          type="button"
          className={`px-2 py-1 rounded ${selectedTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedTab('all')}
        >
          All
        </button>
        {['activity', 'note', 'email', 'file', 'document', 'invoice', 'changelog'].map((type) => (
          <button
            key={type}
            type="button"
            className={`px-2 py-1 rounded whitespace-nowrap ${selectedTab === type ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedTab(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}s ({items.filter(item => item.type === type).length})
          </button>
        ))}
      </div>
      <div className="space-y-4 relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
        {filteredItems.map((item, index) => (
          <div 
            key={item.id} 
            className="flex items-start space-x-4 p-2 rounded cursor-pointer hover:bg-gray-100 relative"
            onClick={() => setSelectedItem(item)}
          >
            <div className="z-10 rounded-full p-2 bg-white border-2 border-gray-300">
              {getIcon(item.type)}
            </div>
            <div className="flex-grow">
              <div className="font-semibold">{item.title}</div>
              <div className="text-sm text-gray-500">
                {formatDate(item.date)} · {item.notes}
              </div>
            </div>
            <div className="text-xs text-gray-400 font-medium">
              {formatMonthDate(item.date)}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={selectedItem !== null} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
          </DialogHeader>
          <div>
            <p><strong>Date:</strong> {selectedItem && formatDate(selectedItem.date)}</p>
            <p><strong>Description:</strong> {selectedItem?.notes}</p>
            {selectedItem?.content && <p><strong>Content:</strong> {selectedItem.content}</p>}
            {selectedItem?.participants && (
              <p><strong>Participants:</strong> {selectedItem.participants.join(', ')}</p>
            )}
            {selectedItem?.relatedItems && (
              <p><strong>Related Items:</strong> {selectedItem.relatedItems.join(', ')}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
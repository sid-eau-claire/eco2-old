import React, { useState } from 'react';
import { Calendar, Clock, Plus, X } from 'lucide-react';
import {GoogleCalendar }   from '@/components/Calendar';

const RecordTabs = () => {
  const [activeTab, setActiveTab] = useState('Activity');
  const [showScheduler, setShowScheduler] = useState(false);

  const tabs = ['Activity', 'Notes', 'Meeting scheduler', 'Call', 'Email', 'Files', 'Documents', 'Invoice'];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Activity':
        return <ActivityTab />;
      case 'Notes':
        return <NotesTab />;
      case 'Meeting scheduler':
        return <MeetingSchedulerTab />;
      case 'Documents':
        return <DocumentsTab />;
      default:
        return <div>Content for {activeTab} tab</div>;
    }
  };

  return (
    <div className="w-full">
      <div className="flex space-x-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        <button className="px-4 py-2 text-gray-600">×</button>
      </div>
      <div className="mt-4">
        {renderTabContent()}
      </div>
      {showScheduler && <SchedulerOverlay onClose={() => setShowScheduler(false)} />}
    </div>
  );
};

const ActivityTab = () => (
  <div>
    <p>Activity content goes here</p>
  </div>
);

const NotesTab = () => (
  <div className="bg-yellow-50 p-4 rounded-md">
    <div className="flex space-x-2 mb-2">
      <button className="p-1 hover:bg-yellow-100 rounded"><strong>B</strong></button>
      <button className="p-1 hover:bg-yellow-100 rounded"><i>I</i></button>
      <button className="p-1 hover:bg-yellow-100 rounded"><u>U</u></button>
      <button className="p-1 hover:bg-yellow-100 rounded">🔗</button>
      <button className="p-1 hover:bg-yellow-100 rounded">@</button>
      <button className="p-1 hover:bg-yellow-100 rounded">🖼️</button>
      <button className="p-1 hover:bg-yellow-100 rounded">•</button>
      <button className="p-1 hover:bg-yellow-100 rounded">1.</button>
      <button className="p-1 hover:bg-yellow-100 rounded">⇤</button>
      <button className="p-1 hover:bg-yellow-100 rounded">⇥</button>
      <button className="p-1 hover:bg-yellow-100 rounded">✂️</button>
    </div>
    <textarea className="w-full h-32 bg-transparent resize-none outline-none" placeholder="Enter your notes here..."></textarea>
  </div>
);

const MeetingSchedulerTab = () => (
  <div>
    <GoogleCalendar />
    {/* <p>Meeting scheduler content goes here</p> */}
  </div>
);

const DocumentsTab = () => (
  <div className="text-center">
    <h2 className="text-2xl font-bold mb-4">Smart Docs</h2>
    <p className="mb-4">Close deals faster by generating sales documents straight from Pipedrive</p>
    <div className="flex justify-center space-x-4 mb-4">
      <button className="text-blue-600">Autofill</button>
      <button>eSignatures</button>
      <button>Shared templates</button>
      <button>Tracking</button>
    </div>
    <p className="mb-4">Save time and reduce errors by autofilling documents with Pipedrive data.</p>
    <div className="flex justify-center mb-4">
      <img src="/api/placeholder/400/200" alt="Autofill demonstration" className="rounded-lg shadow-md" />
    </div>
    <div className="flex justify-center space-x-4">
      <button className="px-4 py-2 bg-gray-200 rounded">Start exploring</button>
      <button className="px-4 py-2 bg-green-600 text-white rounded">Connect cloud storage</button>
    </div>
  </div>
);

const SchedulerOverlay = ({ onClose }: {onClose: any}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg w-2/3 max-w-3xl">
      <div className="flex justify-between items-center mb-4">
        <input type="text" placeholder="Call" className="text-xl font-bold border-b-2 border-gray-300 focus:border-blue-500 outline-none" />
        <button onClick={onClose}><X /></button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="flex space-x-2 mb-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Call</button>
            <button className="px-4 py-2 bg-gray-200 rounded">Meeting</button>
            <button className="px-4 py-2 bg-gray-200 rounded">Task</button>
            <button className="px-4 py-2 bg-gray-200 rounded">Deadline</button>
            <button className="px-4 py-2 bg-gray-200 rounded">Email</button>
            <button className="px-4 py-2 bg-gray-200 rounded">Lunch</button>
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <Calendar size={18} />
            <input type="date" className="border rounded px-2 py-1" defaultValue="2024-07-05" />
            <input type="time" className="border rounded px-2 py-1" />
            <span>-</span>
            <input type="time" className="border rounded px-2 py-1" />
            <input type="date" className="border rounded px-2 py-1" defaultValue="2024-07-05" />
          </div>
          <button className="text-blue-600 mb-4">Add location, video call, description</button>
          <div className="mb-4">
            <select className="border rounded px-2 py-1">
              <option>Free</option>
            </select>
          </div>
          <textarea className="w-full h-24 border rounded p-2 mb-4" placeholder="Notes are visible within Pipedrive, but not to event guests"></textarea>
          <div className="mb-4">
            <select className="w-full border rounded px-2 py-1">
              <option>John (You)</option>
            </select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-gray-100 rounded p-2">
              <span>[Sample] EmpowerMove</span>
              <button><X size={18} /></button>
            </div>
            <div className="flex items-center justify-between bg-gray-100 rounded p-2">
              <span>[Sample] Gloria Quinn</span>
              <button><X size={18} /></button>
            </div>
            <div className="flex items-center justify-between bg-gray-100 rounded p-2">
              <span>[Sample] EmpowerMove</span>
              <button><X size={18} /></button>
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <button>&lt;</button>
            <span>Friday, July 5th</span>
            <button>&gt;</button>
          </div>
          <div className="bg-blue-600 text-white rounded p-2 mb-2">Call</div>
          <div className="space-y-2">
            {[...Array(11)].map((_, i) => (
              <div key={i} className="flex">
                <span className="w-16">{i + 10}:00 AM</span>
                <div className="flex-grow border-l border-gray-300 pl-2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" />
          Mark as done
        </label>
        <div>
          <button className="px-4 py-2 bg-gray-200 rounded mr-2">Cancel</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  </div>
);

export default RecordTabs;
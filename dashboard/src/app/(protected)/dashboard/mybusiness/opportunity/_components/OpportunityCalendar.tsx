import React, { useState, useEffect, useCallback } from 'react';
import Calendar from './Calendar';

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

interface OpportunityCalendarProps {
  newActivity: ActivityType;
  setNewActivity: React.Dispatch<React.SetStateAction<ActivityType>>;
}

const OpportunityCalendar: React.FC<OpportunityCalendarProps> = ({ newActivity, setNewActivity }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(newActivity.startDate));
  const [calendarStartTime, setCalendarStartTime] = useState(9);
  const [calendarEndTime, setCalendarEndTime] = useState(18);

  const updateCalendarTimeRange = useCallback((date: Date) => {
    const startHour = date.getHours();
    const endHour = new Date(date.getTime() + 3600000).getHours();
    setCalendarStartTime(Math.max(0, startHour - 1));
    setCalendarEndTime(Math.min(24, endHour + 1));
  }, []);

  useEffect(() => {
    setSelectedDate(new Date(newActivity.startDate));
    updateCalendarTimeRange(new Date(newActivity.startDate));
  }, [newActivity.startDate, updateCalendarTimeRange]);

  const handleDateChange = useCallback((newDate: Date | ((prevDate: Date) => Date)) => {
    setSelectedDate(prevDate => {
      const updatedDate = newDate instanceof Date ? newDate : newDate(prevDate);
      updateCalendarTimeRange(updatedDate);
      setNewActivity(prev => ({
        ...prev,
        startDate: updatedDate,
        endDate: new Date(updatedDate.getTime() + 3600000) // 1 hour later
      }));
      return updatedDate;
    });
  }, [setNewActivity, updateCalendarTimeRange]);

  return (
    <aside className='border-l'>
      <Calendar
        selectedDate={selectedDate}
        setSelectedDate={handleDateChange}
        newActivity={newActivity}
        calendarStartTime={calendarStartTime}
        calendarEndTime={calendarEndTime}
      />
    </aside>
  );
};

export default OpportunityCalendar;
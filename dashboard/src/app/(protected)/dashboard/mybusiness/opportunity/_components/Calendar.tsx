import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getEvents } from './../_actions/opportunities' // Update this import path if necessary

type Activity = {
  type: 'Call' | 'Meeting' | 'Task' | 'Deadline' | 'Email' | 'Lunch';
  subject: string;
  startDate: Date;
  endDate: Date;
  priority: 'Low' | 'Medium' | 'High';
  location: string
  videoCallLink: string;
  description: string;
  status: 'Free' | 'Busy' | 'Out of Office';
  notes: string;
  participants: { name: string; email: string }[];
};

type CalendarProps = {
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  newActivity: Activity;
  calendarStartTime: number;
  calendarEndTime: number;
};

type GoogleEvent = {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
};

const Calendar: React.FC<CalendarProps> = ({ 
  selectedDate, 
  setSelectedDate, 
  newActivity, 
  calendarStartTime, 
  calendarEndTime 
}) => {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [displayDate, setDisplayDate] = useState(selectedDate);

  useEffect(() => {
    setDisplayDate(new Date(newActivity.startDate));
  }, [newActivity.startDate]);

  useEffect(() => {
    const fetchEvents = async () => {
      const startOfDay = new Date(displayDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(displayDate);
      endOfDay.setHours(23, 59, 59, 999);

      const result = await getEvents(startOfDay.toISOString(), endOfDay.toISOString());
      if (result.items) {
        setEvents(result.items);
      }
    };

    fetchEvents();
  }, [displayDate]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isActivityTimeSlot = (hour: number) => {
    const startHour = new Date(newActivity.startDate).getHours();
    const endHour = new Date(newActivity.endDate).getHours();
    return hour >= startHour && hour < endHour;
  };

  const isEventTimeSlot = (hour: number, event: GoogleEvent) => {
    const startHour = new Date(event.start.dateTime).getHours();
    const endHour = new Date(event.end.dateTime).getHours();
    return hour >= startHour && hour < endHour;
  };

  const renderTimeSlots = () => {
    const slots = [];
    for (let hour = calendarStartTime; hour <= calendarEndTime; hour++) {
      const isActivitySlot = isActivityTimeSlot(hour);
      const eventsInThisSlot = events.filter(event => isEventTimeSlot(hour, event));

      slots.push(
        <div 
          key={hour} 
          className="flex items-center h-12 border-t relative"
          onMouseEnter={() => setHoveredSlot(hour)}
          onMouseLeave={() => setHoveredSlot(null)}
        >
          <span className="w-16 text-right pr-2 text-sm text-gray-500">
            {hour.toString().padStart(2, '0')}:00
          </span>
          <div className="flex-grow h-full relative">
            {isActivitySlot && (
              <div className="absolute inset-0 bg-blue-200 opacity-50 z-10">
                {hour === new Date(newActivity.startDate).getHours() && (
                  <span className="text-xs p-1">
                    {newActivity.type} - {newActivity.subject}
                  </span>
                )}
              </div>
            )}
            {eventsInThisSlot.map((event) => (
              <div key={event.id} className="absolute inset-0 bg-green-200 opacity-50 z-20">
                {hour === new Date(event.start.dateTime).getHours() && (
                  <span className="text-xs p-1">
                    {event.summary}
                  </span>
                )}
              </div>
            ))}
          </div>
          {(isActivitySlot || eventsInThisSlot.length > 0) && hoveredSlot === hour && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute left-full ml-2 z-30">
                    <Card>
                      <CardContent className="p-2">
                        {isActivitySlot && (
                          <>
                            <p><strong>{newActivity.type}</strong></p>
                            <p>{newActivity.subject}</p>
                            <p>Start: {formatTime(newActivity.startDate)}</p>
                            <p>End: {formatTime(newActivity.endDate)}</p>
                          </>
                        )}
                        {eventsInThisSlot.map((event) => (
                          <div key={event.id}>
                            <p><strong>{event.summary}</strong></p>
                            <p>Start: {formatTime(new Date(event.start.dateTime))}</p>
                            <p>End: {formatTime(new Date(event.end.dateTime))}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Event Details
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    }
    return slots;
  };

  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(displayDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setDisplayDate(newDate);
    setSelectedDate(newDate);
  };

  return (
    <Card className="h-full rounded-none">
      <CardHeader className="flex flex-row justify-center items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => changeDate('prev')}
        >
          <ChevronLeft size={12} />
        </Button>
        <span className="text-sm">{displayDate.toDateString()}</span>
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={() => changeDate('next')}
        >
          <ChevronRight size={12} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border">
          {newActivity.startDate && newActivity.endDate && (
            <div className="p-2 bg-blue-100 border-b text-center font-semibold">
              {formatTime(newActivity.startDate)} - {formatTime(newActivity.endDate)}
            </div>
          )}
          {renderTimeSlots()}
        </div>
      </CardContent>
    </Card>
  );
};

export default Calendar;
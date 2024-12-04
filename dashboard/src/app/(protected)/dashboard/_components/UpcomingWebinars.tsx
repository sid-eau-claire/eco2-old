import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isSameDay } from 'date-fns';

// Mock data for webinars
const webinars = [
  { id: 1, title: 'Life Insurance', date: new Date(2024, 7, 5, 14, 0) },
  { id: 2, title: 'Universal Life Insurance', date: new Date(2024, 7, 12, 15, 30) },
  { id: 3, title: 'Term Insurance', date: new Date(2024, 7, 19, 13, 0) },
  { id: 4, title: 'Travel', date: new Date(2024, 7, 26, 16, 0) },
];

// Thumbnail view component
export const UpcomingWebinarsThumbnail = () => {
  return (
    <Card className="h-full w-full bg-black/30">
      <CardHeader>
        <CardTitle className='text-whiten'>Upcoming Webinars</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {webinars.slice(0, 3).map((webinar) => (
            <div key={webinar.id} className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-whiten">{webinar.title}</h3>
                <p className="text-sm text-gray-500 text-whiten">
                  {format(webinar.date, 'MMM d, yyyy')}
                </p>
              </div>
              <Badge>{format(webinar.date, 'h:mm a')}</Badge>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Main component (expanded view)
export const UpcomingWebinars = () => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  
  const webinarsOnSelectedDate = webinars.filter(
    (webinar) => selectedDate && isSameDay(webinar.date, selectedDate)
  );

  const hasWebinarOnDate = (date: Date) => {
    return webinars.some((webinar) => isSameDay(webinar.date, date));
  };

  return (
    <Card className="h-full w-full max-w-4xl mx-auto bg-white/70">
      <CardHeader>
        <CardTitle>Upcoming Webinars</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border w-full md:w-auto"
            modifiers={{
              event: (date) => hasWebinarOnDate(date),
            }}
            modifiersStyles={{
              event: { color: 'blue' },
            }}
            components={{
              DayContent: ({ date }) => (
                <div
                  className={`w-full h-full flex items-center justify-center ${
                    isSameDay(date, new Date()) ? 'bg-green-500 text-white rounded-full' : ''
                  }`}
                >
                  {date.getDate()}
                </div>
              ),
            }}
          />
          <div className="mt-4 md:mt-0 md:ml-4 flex-grow">
            <h3 className="font-semibold mb-2">
              Events on {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'selected date'}:
            </h3>
            <ScrollArea className="h-[200px]">
              {webinarsOnSelectedDate.length > 0 ? (
                webinarsOnSelectedDate.map((webinar) => (
                  <div key={webinar.id} className="mb-2">
                    <h4 className="font-medium">{webinar.title}</h4>
                    <p className="text-sm text-gray-500">
                      {format(webinar.date, 'h:mm a')}
                    </p>
                    <a
                      href="https://zoom.us/j/4032005494"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      Attend
                    </a>
                  </div>
                ))
              ) : (
                <p>No events on this date.</p>
              )}
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingWebinars;
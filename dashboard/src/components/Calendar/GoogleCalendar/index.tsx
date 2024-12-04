import { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns';
import { getEvents } from './_actions/googleEvents';
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaClock, FaUser, FaUsers, FaInfoCircle } from 'react-icons/fa';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Event {
  id: string;
  summary: string;
  start: {
    dateTime: string;
  };
  end: {
    dateTime: string;
  };
  location: string;
  description: string;
  organizer: {
    email: string;
  };
  status: string;
  attendees: {
    email: string;
    responseStatus: string;
  }[];
}

const Calendar: React.FC = ({clientEmail}: {clientEmail?: string}) => {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (session) {
      fetchEventsForMonth(currentMonth);
    }
  }, [session, currentMonth]);

  const fetchEventsForMonth = async (month: Date) => {
    try {
      const startDate = startOfMonth(month).toISOString();
      const endDate = endOfMonth(month).toISOString();
      const data = await getEvents(startDate, endDate);
      setEvents(data?.items);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const renderEvent = (date: Date) => {
    const dayEvents = events?.filter(event =>
      new Date(event?.start?.dateTime).toDateString() === date.toDateString()
    );

    return dayEvents?.slice(0, 2).map(event => (
      <div
        key={event.id}
        className="event w-full overflow-hidden text-ellipsis whitespace-nowrap"
        title={event.summary}
        onClick={() => handleEventClick(event)}
      >
        <span className="event-name text-sm font-semibold text-black dark:text-white">
          {event.summary}
        </span>
      </div>
    ));
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const renderCells = () => {
    const startDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(endOfMonth(currentMonth));
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        days.push(
          <td
            key={day.toString()}
            className={`ease relative h-20 cursor-pointer border border-stroke p-1 sm:p-2 transition duration-500 hover:bg-gray dark:border-strokedark dark:hover:bg-meta-4 md:h-25 md:p-4 xl:h-31 ${
              !isSameMonth(day, currentMonth) ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
          >
            <span className="absolute top-0 left-0 p-1 text-xs font-medium text-black dark:text-white">
              {formattedDate}
            </span>
            <div className="group mt-4 h-16 w-full flex-grow cursor-pointer py-1 md:h-30">
              {renderEvent(cloneDay)}
            </div>
          </td>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <tr key={day.toString()} className="grid grid-cols-7">
          {days}
        </tr>
      );
      days = [];
    }
    return <tbody>{rows}</tbody>;
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const isSameMonth = (date1: Date, date2: Date) => {
    return date1.getMonth() === date2.getMonth();
  };

  if (!session) {
    return <button onClick={() => signIn('google')}>Sign in with Google</button>;
  }

  return (
    <>
      <div className="w-full flex flex-row justify-between items-center my-4">
        <h2 className="text-2xl font-bold mx-4">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className='space-x-8'>
          <button onClick={prevMonth} className="text-blue-500">
            <FaChevronLeft size={30} />
          </button>
          <button onClick={nextMonth} className="text-blue-500">
            <FaChevronRight size={30} />
          </button>
        </div>
      </div>
      <div className="w-full max-w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <table className="w-full">
          <thead>
            <tr className="grid grid-cols-7 rounded-t-sm bg-primary text-white">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <th key={index} className="flex h-15 items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5">
                  <span className="block ">{day}</span>
                </th>
              ))}
            </tr>
          </thead>
          {renderCells()}
        </table>
      </div>
      {selectedEvent && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">{selectedEvent.summary}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="mt-4 max-h-[60vh] pr-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaClock className="text-primary" />
                  <div>
                    <p className="font-medium">{format(new Date(selectedEvent.start.dateTime), 'PPpp')}</p>
                    <p className="text-sm">to {format(new Date(selectedEvent.end.dateTime), 'PPpp')}</p>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FaMapMarkerAlt className="text-primary" />
                    <p>{selectedEvent.location}</p>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-gray-600">
                  <FaUser className="text-primary" />
                  <p>{selectedEvent.organizer.email}</p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <FaUsers className="text-primary" />
                    <p className="font-medium">Attendees</p>
                  </div>
                  <div className="ml-6 space-y-2">
                    {selectedEvent.attendees.map((attendee, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={`https://www.gravatar.com/avatar/${attendee.email}?d=mp`} />
                          <AvatarFallback>{attendee.email[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{attendee.email}</span>
                        <Badge variant={attendee.responseStatus === 'accepted' ? 'secondary' : 'outline'}>
                          {attendee.responseStatus}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedEvent.description && (
                  <div>
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                      <FaInfoCircle className="text-primary" />
                      <p className="font-medium">Description</p>
                    </div>
                    <div className="ml-6 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedEvent.description }} />
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Calendar;
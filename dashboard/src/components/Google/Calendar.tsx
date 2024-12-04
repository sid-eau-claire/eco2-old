"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { format, addMonths, subMonths } from "date-fns";

const Calendar = () => {
  const { data: session } = useSession();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      if (session?.user.googleAccessToken) {
        const res = await fetch(`/api/calendar?timeMin=${selectedDate.toISOString()}`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        } else {
          console.error("Failed to fetch events");
        }
      }
    };

    if (session) {
      fetchEvents();
    }
  }, [session, selectedDate]);

  const handleNextMonth = () => {
    setSelectedDate(addMonths(selectedDate, 1));
  };

  const handlePreviousMonth = () => {
    setSelectedDate(subMonths(selectedDate, 1));
  };

  const handleEventChange = (id: string, updatedEvent: any) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => (event.id === id ? updatedEvent : event))
    );
  };

  const saveEvent = async (event: any) => {
    const res = await fetch(`/api/calendar/${event.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (res.ok) {
      const updatedEvent = await res.json();
      handleEventChange(event.id, updatedEvent);
    }
  };

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <button
          onClick={() => signIn("google")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Sign in with Google
        </button>
      </div>
    );
  }
  console.log('events', events)
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePreviousMonth} className="bg-gray-300 px-2 py-1 rounded">Previous</button>
        <h1 className="text-2xl font-bold">{format(selectedDate, "MMMM yyyy")}</h1>
        <button onClick={handleNextMonth} className="bg-gray-300 px-2 py-1 rounded">Next</button>
      </div>
      <ul>
        {events.map((event) => (
          <li key={event.id} className="mb-2">
            <input
              type="text"
              value={event.summary}
              onChange={(e) => handleEventChange(event.id, { ...event, summary: e.target.value })}
              onBlur={() => saveEvent(event)}
              className="border p-1 w-full"
            />
            <p className="text-sm text-gray-600">{new Date(event.start.dateTime).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Calendar;

// app/api/google/calendar/route.ts
'use server'

import { accessWithAuth } from '@/lib/isAuth';

export const getEvents = async (startDate: string, endDate: string) => {
  const session: any = await accessWithAuth();
  console.log('session', session)
  if (!session?.user?.googleAccessToken) {
    console.error('Google Access token not found');
    return { message: 'Not authenticated' };
  }

  const googleAccessToken = session.user.googleAccessToken;

  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startDate}&timeMax=${endDate}`, {
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to fetch calendar events:', errorData);
      throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return { message: 'Error fetching calendar events', status: 500 };
  }
};

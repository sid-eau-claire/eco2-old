// app/api/google/calendar/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.googleAccessToken) {
    console.error('Google Access token not found');
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const googleAccessToken = token.googleAccessToken;
  console.log('Access Token:', googleAccessToken);

  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ message: 'Error fetching calendar events' }, { status: 500 });
  }
}

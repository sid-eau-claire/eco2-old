import { google } from "googleapis";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session:any = await getServerSession(authOptions as any);
  const url = new URL(request.url);
  const timeMin = url.searchParams.get("timeMin");

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = session.accessToken as string;
  if (!accessToken) {
    return NextResponse.json({ error: "No access token" }, { status: 401 });
  }

  const calendar = google.calendar({ version: "v3", auth: accessToken });

  try {
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin || new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    return NextResponse.json(response.data.items);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// import { google } from "googleapis";
// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth";

// export async function GET(request: Request) {
//   const session: any = await getServerSession(authOptions as any);
//   const url = new URL(request.url);
//   const timeMin = url.searchParams.get("timeMin");

//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const accessToken = session.accessToken as string;
//   if (!accessToken) {
//     return NextResponse.json({ error: "No access token" }, { status: 401 });
//   }

//   const auth = new google.auth.OAuth2();
//   auth.setCredentials({ access_token: accessToken });

//   const calendar = google.calendar({ version: "v3", auth });

//   try {
//     const response = await calendar.events.list({
//       calendarId: "primary",
//       timeMin: timeMin || new Date().toISOString(),
//       maxResults: 10,
//       singleEvents: true,
//       orderBy: "startTime",
//     });

//     return NextResponse.json(response.data.items);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
//   }
// }

export async function POST(request: Request) {
  const session: any = await getServerSession(authOptions as any);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = session.accessToken as string;
  if (!accessToken) {
    return NextResponse.json({ error: "No access token" }, { status: 401 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const calendar: any = google.calendar({ version: "v3", auth });

  try {
    const { summary, description, start, end } = await request.json();

    const event = {
      summary,
      description,
      start: { dateTime: start, timeZone: "UTC" },
      end: { dateTime: end, timeZone: "UTC" },
    };

    const response: any = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

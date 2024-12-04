import { google } from "googleapis";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session:any = await getServerSession(authOptions as any);
  const eventId = params.id;
  const updatedEvent = await request.json();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = session.accessToken as string;
  const calendar = google.calendar({ version: "v3", auth: accessToken });

  try {
    const response = await calendar.events.update({
      calendarId: "primary",
      eventId,
      requestBody: updatedEvent,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

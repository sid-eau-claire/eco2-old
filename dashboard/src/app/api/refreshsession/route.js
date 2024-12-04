// src/app/api/refreshsession/route.js

import { getToken } from "next-auth/jwt";
import { NextResponse } from 'next/server';
import { authOptions } from "@/lib/auth"; // Adjust the path to your auth options

export async function GET(request) {
  try {
    const token = await getToken({ req: request });

    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Re-fetch profile data from your backend
    // const userData = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/users?filters[email][$eq]=${token.email}&populate=profile`, {
    const userData = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/profiles?filters[id][$eq]=${token?.data?.profile?.id}&populate[externalAccount]=*&populate[appRoles]=*&populate[profileImage]=*`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
      }
    });

    const data = await userData.json();

    if (data.length === 0) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    // Update token with new profile data
    const updatedToken = {
      ...token,
      user: {
        ...token.user,
        data: data[0]
      }
    };
    console.log("Updated token:", updatedToken);
    return NextResponse.json(updatedToken, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/refreshsession:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

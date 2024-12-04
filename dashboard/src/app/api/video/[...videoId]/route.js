// src/app/api/video/[...videoId]/route.tsx
import { NextRequest, NextResponse } from 'next/server';

// Note: Adjusted to use default export directly for the route logic
export async function GET(req) {
  // Assuming 'videoId' is the last part of the URL
  const videoId = req.nextUrl.pathname.split('/').pop();

  const accessToken = process.env.VIMEO_ACCESS_TOKEN; // Ensure your token is stored securely
  const url = `https://api.vimeo.com/videos/${videoId}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch video details');
    }

    const data = await response.json();
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: 'Failed to load video data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Remove any `export const handler = ...` or similar exports

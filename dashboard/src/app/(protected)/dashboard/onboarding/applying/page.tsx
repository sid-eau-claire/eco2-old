
import React from 'react';
import Applying from './Applying';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const page = async () => {
  let result = null;
  const session = await getServerSession(authOptions as any);

  try {
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/invitations?filters[inviteEmail][$eq]=${(session as { user: { data: { email: string } } })?.user?.data.email}&populate=*`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    result = await response.json();
    console.log('result', result);
  } catch (error) {
    console.error('Error:', error);
    result = null; // or { data: [] } depending on your handling logic
  }

  return (
    <>
      <Applying invitation={result?.data?.[0]}/>
    </>
  );
}

export default page;

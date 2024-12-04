import React from 'react';
import ProfileSetup from './ProfileSetup';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { signOut } from "next-auth/react"

const page = async () => {
  let result = null;
  const session = await getServerSession(authOptions as any);
  const changeRole = async (roleId: number) => {
    'use server'
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/users/${(session as { user: { data: { id: string } } })?.user?.data?.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
      },
      body: JSON.stringify({
        role: roleId
      })
    });
    if (response.ok) {
      return true 
    } else {
      console.log(`Error: ${response.statusText}`);
      return false
    }
  }

  try {
    const response = await fetch(`${process.env.STRAPI_BACKEND_API}/api/invitations?filters[inviteEmail][$eq]=${(session as { user: { data: { email: string } } })?.user?.data.email}&populate=*`, {
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
    if (!result?.data?.[0]) {
      // signOut() 
    }
  } catch (error) {
    console.error('Error:', error);
    result = null; // or { data: [] } depending on your handling logic
  }

  return (
    <>
      <ProfileSetup invitation={result?.data?.[0]} changeRole={changeRole} />
    </>
  );
}

export default page;

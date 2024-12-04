"use server";
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileSchema, zProfileSchema } from "@/types/profile";
import { ZodError } from "zod";
import { Session } from '@/types/session';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { findChanges, convertObject, InputObject } from '@/lib/updateRecord';


export default async function ProfileData(oldData: ProfileSchema, newData: ProfileSchema) {
  const session: Session | null = await getServerSession(authOptions as any);
  // const profileId = session?.user?.data?.profile?.id || '';
  const profileId = newData.id

  try {
    const changes = findChanges(oldData, newData);
    console.log('Changes:', changes);
    const inputObj: InputObject = changes;
    const data = await convertObject(inputObj)
    // console.log(data);
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/profiles/${profileId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
      },
      next: { tags: ['profile'] },
      body: JSON.stringify(data),
    });
  }
  catch (error) {
    console.error('Error finding changes:', error);
    throw new Error('Error finding changes');
  } 
}

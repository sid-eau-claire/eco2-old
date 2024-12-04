'use server'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const addContact = async (data: any) => {
  const session = await getServerSession(authOptions as any);
  console.log(data)
  console.log(session)
  const dataWithAdvisor = {...data, advisor: (session as { user: { data: { id: string } } })?.user?.data?.id}
  console.log(dataWithAdvisor)
  const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
    },
    body: JSON.stringify({data: dataWithAdvisor})
  });
  console.log(response)
}
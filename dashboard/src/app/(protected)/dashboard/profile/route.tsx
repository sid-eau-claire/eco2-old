import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const session: { user: { accessToken: string, data: { profile: { id: number, status: string } } } } | null = await getServerSession(authOptions as any);
  // redirect(`/dashboard/profile/editprofile/${session?.user?.data?.profile?.id}`)
  if (session?.user?.data?.profile == null || session?.user?.data?.profile?.status != "completed") {
    redirect('/dashboard/profile/createprofile')
  } else {
    redirect(`/dashboard/profile/editprofile/${session?.user?.data?.profile?.id}`)
  }
}
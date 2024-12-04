import Main from '../_components/Main'
import React from 'react'
import { accessWithAuth, canAccess } from '@/lib/isAuth'
import { redirect } from 'next/navigation'

const page = async ({ params }: { params: { advisor: string } }) => {
  const advisor = params.advisor
  const session = await accessWithAuth()
  if (!canAccess(['Superuser', 'Advisor', 'Poweruser'],[], Number(advisor))) {
    redirect('/dashboard/error'); 
  }

 
  return (
    <>
      <Main profileId={advisor} />
    </>
  )
}

export default page
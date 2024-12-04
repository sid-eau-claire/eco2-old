import React from 'react'
import ListRecord from '../_components/ListRecord'
import { canAccess, accessWithAuth } from '@/lib/isAuth'
import { redirect } from 'next/navigation'

const page = async ({ params }: { params: { advisor: string } }) => {
  const advisor = params.advisor
  
  const session = await accessWithAuth()
  if (!canAccess(['Superuser', 'Advisor', 'Poweruser'])) {
    redirect('/dashboard/error'); 
  }
  if (!canAccess(['Advisor', 'Poweruser'],[], Number(advisor))) {
    redirect('/dashboard/error'); 
  }
  // console.log('oppId', oppId)
  return (
    <>
      <ListRecord profileId={advisor}/>
      {/* <AddRecord /> */}
    </>
  )
}

export default page
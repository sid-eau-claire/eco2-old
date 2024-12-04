import React from 'react'
import ListRecord from './_components/ListRecord'
import { canAccess, accessWithAuth } from '@/lib/isAuth'
import { redirect, } from 'next/navigation'

const page = async () => {
  if (!canAccess(['Superuser', 'Advisor', 'Poweruser'])) {
    redirect('/dashboard/error');
  }
  const session = await accessWithAuth();
  return (
    <>
      <ListRecord session={session}/>
      {/* <ListRecord /> */}
    </>
  )
}

export default page
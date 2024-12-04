import React from 'react'
import ListRecord from './_components/ListRecord'
import { canAccess, accessWithAuth } from '@/lib/isAuth'
import { redirect } from 'next/navigation'
import TabView  from './_components/TabView'

const page = async ({ params }: { params: { advisor: string } }) => {
  const advisor = params.advisor
  const session = await accessWithAuth()
  if (!canAccess(['Superuser', 'InternalStaff', 'Poweruser'])) {
    redirect('/dashboard/error'); 
  }
  if (!canAccess(['InternalStaff', 'Poweruser'],['newcaseEdit'])) {
    redirect('/dashboard/error'); 
  }    
  return (
    <>
      <TabView/>
    </>
  )
}

export default page
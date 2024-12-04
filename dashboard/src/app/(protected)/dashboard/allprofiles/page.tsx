import React from 'react'
import {getProfiles} from './_actions/getProfile'
import ProfileList from './_components/ProfileList'
import { canAccess } from '@/lib/isAuth'
import { redirect } from 'next/navigation'

const page = async () => {
  const profiles = await getProfiles()
  // console.log(profiles)

  if (!await canAccess(['Superuser', 'Poweruser'])) {
    console.log('You are not allowed to access')
    redirect('/dashboard/error')
  }

  // if (!await canAccess(['Advisor', 'Poweruser'],[], Number(request?.params?.advisor))) {
  //   console.log('You are not allowed to access')
  //   redirect('/dashboard/error')
  // }

  return (
    <>
      <ProfileList profiles={profiles} />
    </>
  )
}

export default page
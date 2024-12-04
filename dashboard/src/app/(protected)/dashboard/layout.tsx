'use server'
import React from 'react'
import { accessWithAuth } from '@/lib/isAuth'
import RootLayoutClient from './layoutClient'

const  RootLayout = async ({children,}:{children: React.ReactNode;}) =>{
  const session = await accessWithAuth()
  // console.log('session', JSON.stringify(session))
  return (
    <>
      <RootLayoutClient session={session}>
        {children}
      </RootLayoutClient>
    </>
  )
}

export default RootLayout

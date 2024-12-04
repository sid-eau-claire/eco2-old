'use client'
import React from 'react'
import {PageContainer, ColContainer} from "@/components/Containers";
import { clearCookiesData } from '@/components/CookieState';
import { useState } from 'react';
import { useSession, getSession, signIn, signOut } from 'next-auth/react';
import { revalidateTag } from 'next/cache';
import {Input } from '@/components/Input';

const Settings = () => {
  const [enabled, setEnabled] = useState<boolean>(true);
  const { data: session, status, update } = useSession()
  const [defaultPage, setDefaultPage] = useState<string>('')

  const refreshSession = () => {
    // Trigger a session refresh
    console.log('reload session')
    // signIn(undefined, { callbackUrl: '/dashboard/settings' });
    signOut({ callbackUrl: '/auth/login' });
  }

  return (
      <PageContainer pageName="Settings">
      <ColContainer cols="3:3:2:1">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              User Preference 
            </h3>
          </div>
          <div className="flex flex-col gap-5.5 p-6.5">
            <Input
              name="defaultPage"
              label="Default Page"
              placeholder="Enter default page"
              onChange={(e)=>{setDefaultPage(e.target.value)}}
            />
            
          </div>
        </div>
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Clear cookies 
            </h3>
          </div>
          <div className="flex flex-row justify-center gap-5.5 p-6.5">
            <button
              className="flex items-center justify-center px-4 h-11 rounded-md bg-primary text-white font-medium duration-300 ease-in-out hover:bg-primarydark hover:scale-105"
              onClick={()=>{clearCookiesData()}}
            >
              Clear cookies
            </button>
          </div>
        </div>
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Session management
            </h3>
          </div>
          <div className="flex flex-row justify-center gap-5.5 p-6.5">
            <button
              className="flex items-center justify-center px-4 h-11 rounded-md bg-primary text-white font-medium duration-300 ease-in-out hover:bg-primarydark hover:scale-105"
              onClick={()=> refreshSession()}
            >
              Reload session
            </button>
          </div>
        </div>
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Clear caches
            </h3>
          </div>
          <div className="flex flex-row justify-center gap-5.5 p-6.5">
            <button
              className="flex items-center justify-center px-4 h-11 rounded-md bg-primary text-white font-medium duration-300 ease-in-out hover:bg-primarydark hover:scale-105"
              onClick={()=>{revalidateTag('guidelines')}}
            >
              Clear guidelines cache
            </button>
          </div>
        </div>        
      </ColContainer>

    </PageContainer>
  )
}

export default Settings
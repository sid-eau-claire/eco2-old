'use client';
import React from 'react'
import { usePathname } from 'next/navigation';

const page = () => {
  const pathname = usePathname();
  return (
    <div className='w-full flex flex-col justify-center items-center'>
      <p>Path {pathname} is under construction</p>
      <p>Comming soon</p>
    </div>
  )
}

export default page
'use client';
import React from 'react'
import { usePathname } from 'next/navigation';
import Settings from './Settings'

const page = () => {
  const pathname = usePathname();
  return (
    <Settings />
  )
}

export default page
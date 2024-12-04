'use client'
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

export const InitiativeThumbnail: React.FC = () => {
  // Mock data - similar to announcements structure
  const initiatives = [
    { id: 1, title: 'Initiatives', image: '//woman-with-tablet.jpg' },
    { id: 3, title: 'Community Impact', image: '/woman-with-tablet.jpg' },
  ];

  return (
    <div className='relative w-full h-full flex justify-center items-center'>
      <div className='bg-black absolute top-0 right-0 left-0 bottom-0 opacity-50'></div>
      <h2 className="text-4xl font-bold text-white z-10">{initiatives[0].title}</h2>
    </div>
  );
};

export const Initiatives: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 ">
      <div className="bg-white opacity-90 p-6 ml-6 rounded-lg">
        <h2 className="text-2xl font-bold">Universal Life Insurance</h2>
        <p className="mt-4">
          Selling universal life insurance requires a strategic, step-by-step approach that builds trust, educates clients, and demonstrates long-term value. To go from "zero to hero," start by developing a deep understanding of the product, including its flexibility, tax benefits, and investment potential. Familiarize yourself with common client profiles that benefit from universal life policies, such as individuals seeking a balance of life insurance protection with savings potential or those planning for estate considerations. 
          &nbsp;<Link className="underline text-blue-600" href="/dashboard/guidelines">Read more</Link>
        </p>
      </div>
    </div>

  );
};
export default Initiatives;
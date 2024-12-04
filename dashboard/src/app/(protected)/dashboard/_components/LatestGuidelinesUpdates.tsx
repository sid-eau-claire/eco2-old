'use client'
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

export const LatestGuidelinesUpdatesThumbnail: React.FC = () => {
  // Mock data structure
  const guidelines = [
    { id: 1, title: 'Guidelines updates', image: '/guidelines-book.jpg' },
  ];

  return (
    <div className='relative w-full h-full flex justify-center items-center'>
      <div className='bg-black absolute top-0 right-0 left-0 bottom-0 opacity-50'></div>
      <h2 className="text-4xl font-bold text-white z-10">{guidelines[0].title}</h2>
    </div>
  );
};

export const LatestGuidelinesUpdates: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
      <div className="bg-white p-6 ml-6 rounded-lg">
        <h2 className="text-2xl font-bold">Guidelines Updates</h2>
        <p className="mt-4">
          Stay informed with our most recent guideline updates and policy changes. These updates ensure you're always aligned with the latest industry standards and best practices. Regular review of these guidelines helps maintain compliance and service excellence.
          &nbsp;<Link className="underline text-blue-600" href="/dashboard/guidelines">Read more</Link>
        </p>
      </div>
    </div>
  );
};

export default LatestGuidelinesUpdates;
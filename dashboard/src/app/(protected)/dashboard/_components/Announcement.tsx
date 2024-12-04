// components/Announcement.tsx
'use client'
import React from 'react';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Link from 'next/link';
import { motion } from 'framer-motion';
export const AnnouncementThumbnail: React.FC = () => {
  // Assume we fetch this data from Strapi
  const announcements = [
    { id: 1, heading: 'Announcement', image: '/toronto-skyline.jpg' },
    { id: 2, heading: 'Announcement', image: '/toronto-skyline.jpg' },
    { id: 3, heading: 'Announcement', image: '/toronto-skyline.jpg' },
    { id: 4, heading: 'Announcement', image: '/toronto-skyline.jpg' },
    // ... more announcements
  ];

  return (
    <Carousel className="w-full h-full relative justify-center items-center">
      <div className='bg-black absolute top-0 right-0 left-0 bottom-0 opacity-50'></div>
      <CarouselContent className=''>
        {announcements.map((announcement) => (
          <CarouselItem key={announcement.id}>
            <div className="h-64 w-full flex justify-center items-center">
              <h2 className="text-4xl font-bold text-whiten pt-8">{announcement.heading}</h2>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 transform -translate-y-1/2" />
      <CarouselNext className="absolute right-4 top-1/2 transform -translate-y-1/2" />
    </Carousel>
  );
};

export const Announcement: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
      <motion.div 
        className="bg-white opacity-90 p-6 ml-6 rounded-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.5,
          ease: "easeOut",
          delay: 0.2
        }}
      >
        <h2 className="text-2xl font-bold">Commission Distribution Enhancements</h2>
        <p className="mt-4">
          We are pleased to announce an exciting update to our commission distribution structure, designed to reward and motivate our high-performing financial advisors. Effective immediately, this new structure provides enhanced benefits for those who demonstrate exceptional performance and commitment to delivering outstanding service to our clients. Our goal with these changes is to better align rewards with the dedication and success our advisors bring to their roles, creating a more rewarding experience and encouraging continued growth. 
          &nbsp;<Link className="underline text-blue-600" href="/dashboard/guidelines">Read more</Link>
        </p>
      </motion.div>
    </div>
  );
}

// export default Announcement;
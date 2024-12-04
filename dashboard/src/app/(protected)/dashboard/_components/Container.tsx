'use client'

import React from 'react';
import { LayoutGrid } from '@/components/ui/layout-grid';
import {AnnouncementThumbnail, Announcement } from './Announcement';
import {Initiatives, InitiativeThumbnail} from './Initiatives';
import {LatestGuidelinesUpdates, LatestGuidelinesUpdatesThumbnail} from './LatestGuidelinesUpdates';
import {UpcomingWebinars, UpcomingWebinarsThumbnail} from './UpcomingWebinars';
import Qualifications from './Qualifications';
import ExploreShop from './ExploreShop';
import MovingText from './MovingText';

const QualificationsAndShopDetails = () => <h2 className='text-4xl text-whiten'>Qualifications</h2>;

const Container: React.FC = () => {
  const cards = [
    {
      id: 1,
      thumbnail: AnnouncementThumbnail,
      className: "col-span-2 row-span-1 min-h-[200px]",
      component: Announcement,
      backgroundImage: '/images/cards/cards-01.png'
    },
    {
      id: 2,
      thumbnail: InitiativeThumbnail,
      className: "col-span-1 row-span-1 min-h-[200px]",
      component: Initiatives,
      backgroundImage: '/images/cards/cards-02.png'
    },
    {
      id: 3,
      thumbnail: LatestGuidelinesUpdatesThumbnail,
      className: "col-span-1 row-span-1 min-h-[200px]",
      component: LatestGuidelinesUpdates,
      backgroundImage: '/images/cards/cards-03.png'
    },
    {
      id: 4,
      thumbnail: UpcomingWebinarsThumbnail,
      className: "col-span-1 row-span-1 min-h-[200px]",
      backgroundImage: '/images/cards/cards-04.png',
      component: () => (
        <>
          <UpcomingWebinars />
          {/* <MovingText /> */}
        </>
      )
    },
    {
      id: 5,
      thumbnail: QualificationsAndShopDetails,
      className: "col-span-1 row-span-1 min-h-[200px]",
      backgroundImage: '/images/cards/cards-05.png',
      component: () => (
        <>
          <Qualifications />
          <ExploreShop />
        </>
      )
    },
  ];

  return (
    <div className="w-full h-full">
      <LayoutGrid cards={cards}/>
    </div>
  );
};

export default Container;
'use client'
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

const ExploreShop: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Explore The Eau Claire Shop</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-40 w-full">
          <Image
            src="/shop-item.jpg"
            alt="Shop item"
            layout="fill"
            objectFit="cover"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ExploreShop;
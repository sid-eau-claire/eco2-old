'use client'

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlayCircle, Info } from 'lucide-react';
import Vimeo from '@u-wave/react-vimeo';

const videos = [
  { id: '761987509', title: 'Video 1', description: 'Description for Video 1' },
  { id: '721129828', title: 'Video 2', description: 'Description for Video 2' },
  { id: '838438467', title: 'Video 3', description: 'Description for Video 3' },
  { id: '901609129', title: 'Video 4', description: 'Description for Video 4' },
  { id: '581333267', title: 'Video 5', description: 'Description for Video 5' },
];

const Education = () => {
  const [featuredVideo, setFeaturedVideo] = useState(videos[0]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-gradient-to-b from-black to-transparent absolute top-0 left-0 right-0 z-10">
        <h1 className="text-4xl font-bold text-red-600">NETFLIX</h1>
        <nav>
          <Button variant="link" className="text-white">Home</Button>
          <Button variant="link" className="text-white">On boarding</Button>
          <Button variant="link" className="text-white">Insurance Products</Button>
          <Button variant="link" className="text-white">Investment Products</Button>
        </nav>
      </header>

      {/* Featured Content */}
      <section className="relative h-screen">
        <div className="absolute inset-0">
          <Vimeo
            video={featuredVideo.id}
            autoplay
            muted
            loop
            responsive
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute bottom-32 left-16 max-w-xl">
          <h2 className="text-5xl font-bold mb-4">{featuredVideo.title}</h2>
          <p className="text-lg mb-6">{featuredVideo.description}</p>
          <div className="flex space-x-4">campfire
            <Button className="bg-white text-black hover:bg-gray-200">
              <PlayCircle className="mr-2 h-4 w-4" /> Play
            </Button>
            <Button variant="secondary">
              <Info className="mr-2 h-4 w-4" /> More Info
            </Button>
          </div>
        </div>
      </section>

      {/* Video Rows */}
      <section className="px-16 py-8">
        <h3 className="text-2xl font-semibold mb-4">Popular on Eau Claire Partners</h3>
        <ScrollArea className="whitespace-nowrap pb-4">
          <div className="flex space-x-4">
            {videos.map((video) => (
              <Card key={video.id} className="w-64 bg-zinc-800 hover:scale-105 transition-transform duration-200">
                <CardContent className="p-0">
                  <Vimeo
                    video={video.id}
                    responsive
                    className="w-full h-36 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-semibold">{video.title}</h4>
                    <p className="text-sm text-gray-400">{video.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </section>

      {/* Additional Rows */}
      <section className="px-16 py-8">
        <h3 className="text-2xl font-semibold mb-4">Trending Now</h3>
        <ScrollArea className="whitespace-nowrap pb-4">
          <div className="flex space-x-4">
            {videos.map((video) => (
              <Card key={video.id} className="w-64 bg-zinc-800 hover:scale-105 transition-transform duration-200">
                <CardContent className="p-0">
                  <Vimeo
                    video={video.id}
                    responsive
                    className="w-full h-36 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-semibold">{video.title}</h4>
                    <p className="text-sm text-gray-400">{video.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </section>

      {/* Footer */}
      <footer className="px-16 py-8 text-gray-500">
        <p>&copy; 2024 Eau Claire Parnters</p>
      </footer>
    </div>
  );
};

export default Education;
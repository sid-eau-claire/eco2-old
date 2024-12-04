import React, { useState, useEffect } from 'react'
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect'
import { motion } from 'framer-motion';
import { CarrierType } from '@/types/carrier';
import Panel from '@/components/ReactParser/Panel'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type CarrierDetailProps = {
  carrier: CarrierType;
}

const Portfolio = ({ carrier }: { carrier: CarrierType }) => {
  const [activeVideo, setActiveVideo] = useState(carrier.carrierVideoId1);
  const videoIds = [
    carrier.carrierVideoId1,
    carrier.carrierVideoId2,
    carrier.carrierVideoId3
  ].filter(Boolean);

  const getThumbnail = async (videoId: string) => {
    try {
      const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
      const data = await response.json();
      return data.thumbnail_url;
    } catch (error) {
      console.error('Error fetching thumbnail:', error);
      return '';
    }
  };

  const [thumbnails, setThumbnails] = useState<string[]>([]);

  useEffect(() => {
    const fetchThumbnails = async () => {
      const thumbs = await Promise.all(videoIds.map(getThumbnail));
      setThumbnails(thumbs);
    };
    fetchThumbnails();
  }, []);

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2">
          <iframe
            src={`https://player.vimeo.com/video/${activeVideo}?autoplay=1&loop=1&autopause=0`}
            width="100%"
            height="400"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="rounded-lg shadow-lg"
          ></iframe>
        </div>
        <div className="col-span-1 flex flex-col justify-between h-[400px]">
          {thumbnails.map((thumb, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveVideo(videoIds[index])}
              className={`cursor-pointer rounded-lg overflow-hidden shadow-md ${activeVideo === videoIds[index] ? 'ring-2 ring-primary' : ''}`}
              style={{ height: 'calc(33.33% - 0.5rem)' }}
            >
              <img
                src={thumb}
                alt={`Video ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 mb-4">
        {carrier.products.map((product: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  <TypewriterEffectSmooth words={product.title} className="text-xl font-semibold" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Panel content={product.description} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Carrier Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Panel content={carrier.content} />
        </CardContent>
      </Card>
    </>
  );
};

export default Portfolio;
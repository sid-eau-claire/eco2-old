import React, { useState, useEffect } from 'react';
import { CarrierType } from '@/types/carrier';
// import { Input } from '@/components/Input';
import { Input } from "@/components/ui/input";
import { motion } from 'framer-motion';
import VideoModal from './VideoModal';
import { ColContainer, RowContainer } from '@/components/Containers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TrainingType = {
  topic: string;
  productType?: { name: string; [key: string]: any };
  link: string;
  details?: any;
  [key: string]: any;
}

type UniqueProductType = {
  id: number;
  name: string;
}

const getTrainingDetail = async (link: string) => {
  console.log(link.trim())
  try {
    const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${link.trim()}`, {
      headers: {
        'Referer': 'two.eauclairepartners.com'
      },
    });
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error fetching training detail', error);
  }
}

const TrainingModule = ({carrier}: { carrier: CarrierType}) => {
  const [trainings, setTrainings] = useState<TrainingType[]>([]);
  const [uniqueProductTypes, setUniqueProductTypes] = useState<UniqueProductType[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProductType, setSelectedProductType] = useState<string>('All');
  const [filteredTraining, setFilteredTraining] = useState<Record<string, TrainingType[]>>({});
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [videosShown, setVideosShown] = useState<Record<string, number>>({});
  const activeVideoDetails = trainings.find(training => training.link === activeVideo)?.details;
  const activeProductType = trainings.find(training => training.link === activeVideo)?.productType?.name;
  const otherVideosInProductType = trainings.filter(training => training.productType?.name === activeProductType && training.link !== activeVideo).map(training => ({
    title: training.topic,
    thumbnail_url: training.details?.thumbnail_url,
    link: training.link,
  }));  

  useEffect(() => {
    const fetchTrainingDetails = async () => {
      const updatedTrainings = await Promise.all(
        carrier.training.map(async (training) => {
          const details = await getTrainingDetail(training.link);
          return { ...training, details };
        })
      );

      setTrainings(updatedTrainings);

      const productTypeMap = new Map<string, UniqueProductType>();
      const initialVideosShown: Record<string, number> = {};
      updatedTrainings.forEach((training) => {
        const productTypeValue = training.productType?.name;
        if (productTypeValue && !productTypeMap.has(productTypeValue)) {
          productTypeMap.set(productTypeValue, { id: productTypeMap.size, name: productTypeValue });
          initialVideosShown[productTypeValue] = 4;
        }
      });
      setVideosShown(initialVideosShown);
      setUniqueProductTypes(Array.from(productTypeMap.values()));
    };

    fetchTrainingDetails();
  }, [carrier.training]);

  useEffect(() => {
    let groupedTraining: Record<string, TrainingType[]> = {};
    
    if (selectedProductType === 'All') {
      groupedTraining = uniqueProductTypes.reduce<Record<string, TrainingType[]>>((acc, type) => {
        acc[type.name] = trainings.filter((training) => {
          const trainingType = training.productType?.name;
          return training?.topic?.toLowerCase().includes(search.toLowerCase()) && trainingType === type.name;
        }).slice(0, videosShown[type.name] || 4);
        return acc;
      }, {});
    } else {
      groupedTraining[selectedProductType] = trainings.filter((training) => {
        const trainingType = training.productType?.name;
        return training?.topic?.toLowerCase().includes(search.toLowerCase()) && trainingType === selectedProductType;
      }).slice(0, videosShown[selectedProductType] || 4);
    }

    setFilteredTraining(groupedTraining);
  }, [search, trainings, uniqueProductTypes, videosShown, selectedProductType]);

  const handleViewMore = (productTypeName: string) => {
    setVideosShown(prevState => ({ ...prevState, [productTypeName]: (prevState[productTypeName] || 4) + 4 }));
  };

  return (
    <ColContainer cols="1:1:1:1">
      <RowContainer className="flex flex-row justify-end items-center border-none py-0 space-x-4">
        <Select onValueChange={(value) => setSelectedProductType(value)} defaultValue="All">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select product type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Product Types</SelectItem>
            {uniqueProductTypes.map((type) => (
              <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="search"
          placeholder="Search..."
          className="max-w-[13rem]"
          onChange={(e) => setSearch(e.target.value)}
        />
      </RowContainer>
      {Object.entries(filteredTraining).map(([productTypeName, trainings], index) => (
        <motion.div key={productTypeName}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 1 + index * 0.2, duration: 0.8 }}
          className='px-4 space-x-2 mb-4'
        >
          <h3 className='text-title-md font-semibold ml-4 mb-2'>{productTypeName}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center">
            {trainings.map((training, tIndex) => (
              <motion.div key={tIndex} onClick={() => setActiveVideo(training.link)} className='flex flex-col justify-center items-center space-x-2 cursor-pointer'
                whileHover={{ scale: 1.1}}
                transition={{ delay: 0, duration: 0.3 }}>
                  <img src={training.details?.thumbnail_url} alt={training.topic} className="w-[16rem] rounded-md shadow-md mb-1" />
                  <p>{training.topic}</p>
               </motion.div>
             ))}
           </div>
           {trainings.length >= 4 && trainings.length >= (videosShown[productTypeName] || 4) && (
            <div className='flex flex-row justify-center'>
             <button
               className="mt-4 px-4 py-2 bg-body text-white rounded hover:bg-blue-600 transition duration-300"
               onClick={() => handleViewMore(productTypeName)}
             >
              View More
             </button>
            </div>
           )}
         </motion.div>
      ))}
      {activeVideo && (
        <VideoModal
          videoLink={activeVideo}
          videoDetails={activeVideoDetails}
          otherVideos={otherVideosInProductType}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </ColContainer>
   );
 };
 
 export default TrainingModule;
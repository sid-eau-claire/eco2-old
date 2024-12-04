'use client'
import React, {useState} from "react";
import Link from "next/link";
import { CardItemProps } from "@/types/cards"; // Import the RootNode type
import Image from "next/image";
import {motion} from 'framer-motion';
// import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';

const CardsItem: React.FC<CardItemProps> = ({key, imageSrc, name, role, href, cardImageSrc, cardTitle, cardSummary, index}) => {
  const [showItem, setShowItem] = useState(false);
  return (
    <motion.div 
      className={`p-0 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark cursor-pointer ` + (showItem ? `absolute top-0 left-0 right-0 bottom-0` : ``)}
      initial={{ opacity: 0.9, x: -100, y: (200 - (index! * 30))  }}
      // initial={{ opacity: 0, x: 0, y:0 }}
      animate={{ opacity: 1, x: 0, y:0 }}
      transition={{ delay: 0 + (index as number) * 0.01 , duration: 0.8, type: 'spring', bounce: 0.45 }}
      whileHover={{ scale: 1.04 }}
    >
      <Link href={href || ""} className="block px-0">
        <Image width={340} height={188} layout="responsive" src={cardImageSrc || ""} className="max-h-[17rem] rounded-t-sm"  alt="Cards" />
        <div className="p-6">
          <h4 className="mb-3 text-xl font-semibold text-black hover:text-primary dark:text-white dark:hover:text-primary">
            <span>{cardTitle}</span>
          </h4>
          {/* <p>{cardContent}</p> */}
          <p>{cardSummary}</p>
          {/* <BlocksRenderer content={cardContent}/>  */}
        </div>
      </Link>
    </motion.div>
  );
};

export default CardsItem;

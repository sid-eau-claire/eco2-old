'use client'
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CarrierType } from "@/types/carrier";
import { motion } from 'framer-motion';
import { twMerge } from "tailwind-merge";

const CarrierItem = ({ index, carrier }: { index: number, carrier: CarrierType }) => {
  const [showItem, setShowItem] = useState(false);
  console.log(carrier)
  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { delay: 0.2, duration: 0.8, type: 'spring', bounce: 0.4 }
    },
    hover: {
      scale: 1.05,
      rotateX: [0, 10, 0],
      rotateY: [0, 10, 0],
      transition: { type: 'spring', stiffness: 300 }
    }
  };
  
  return (
    <motion.div 
      className={`aspect-w-16 aspect-h-8 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark cursor-pointer overflow-hidden ${showItem ? `fixed inset-0 z-50` : `relative`}`}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Link href={`/dashboard/carriers/${carrier.id}`} passHref>
        <div className="flex flex-col justify-between h-full cursor-pointer">
          <div className="w-full p-6" style={{ backgroundColor: carrier.bgColor ? carrier.bgColor : 'transparent' }}>
  
            <Image
              width={140}
              height={140} 
              src={carrier?.photo?.url} 
              alt={carrier.carrierName}
              priority={true}
              className={twMerge( "max-h-[6rem] w-auto", carrier.focus ? "" : "")} 
              // style={{ objectFit: 'cover'}}
              layout="responsive"
              // objectFit="cover" // This will cover the area of the div maintaining aspect ratio
            />
          </div>
          <div className="p-4">
            <h4 className="text-center mb-2 text-2xl font-semibold text-black dark:text-white">
              {carrier.carrierName}
            </h4>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CarrierItem;

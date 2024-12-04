'use client'
import React from 'react';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { motion } from "framer-motion";
import { twMerge } from 'tailwind-merge';

type PageContainerProps = {
  children?: React.ReactNode;
  pageName?: string;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, pageName, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, type: 'spring', bounce: 0.45 }}
      className="relative "
    >
      {pageName && <Breadcrumb pageName={pageName} />}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={twMerge(`rounded-sm  border-transparent bg-transparent  dark:border-strokedark dark:bg-boxdark `, className)}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default PageContainer;

import React from 'react';
import { motion } from 'framer-motion';

type VideosItemProps = {
  title: string;
  embeds?: boolean;
  aspectOne?: boolean;
  aspectFour?: boolean;
  aspectTwentyOne?: boolean;
  src: string;
  isActive: boolean; // Ensure this prop is properly typed
};

const VideosItem: React.FC<VideosItemProps> = ({
  title,
  embeds,
  aspectOne,
  aspectFour,
  aspectTwentyOne,
  src,
  isActive, // Use this prop to determine styling
}) => {
  return (
    <motion.div
      layout // Add layout prop for smooth animation transitions
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, scale: isActive ? 1.2 : 1 }} // Scale up if active
      transition={{ duration: 0.8 }}
      className={`w-full h-auto ${isActive ? 'sm:w-[50%]' : 'sm:w-full'}`} // Use TailwindCSS for responsive design
      onClick={(e) => e.stopPropagation()} // Prevent event bubbling
    >
      <motion.iframe
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0, duration: 0.8 }}
        whileHover={{ scale: isActive ? 1 : 1.05 }} // Adjust hover effect based on isActive
        className={`
          w-full h-auto
          ${embeds ? 'aspect-video' : ''}
          ${aspectOne ? 'aspect-square' : ''} 
          ${aspectFour ? 'aspect-4/3' : ''}
          ${aspectTwentyOne ? 'aspect-21/9' : ''}
        `}
        src={src}
        title={title} // Add a title for accessibility
        allowFullScreen
      ></motion.iframe>
    </motion.div>
  );
};

export default VideosItem;
